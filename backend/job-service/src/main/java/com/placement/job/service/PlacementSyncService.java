package com.placement.job.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Service
public class PlacementSyncService {

    private static final Logger log = LoggerFactory.getLogger(PlacementSyncService.class);
    private static final int MAX_RETRIES = 2;
    private static final Duration RETRY_DELAY = Duration.ofSeconds(1);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient webClient;

    public PlacementSyncService(@Value("${placement.service.url}") String placementServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(placementServiceUrl)
                .build();
    }

    /**
     * Syncs application status update to placement-service.
     * Returns a Mono so the caller can chain it — does NOT subscribe internally.
     * Includes 2 retries with 1s delay. Never propagates errors to caller.
     */
    public Mono<Void> syncStatusUpdate(String studentId, String jobId,
                                        String newStatus, String company) {
        if (studentId == null || studentId.isBlank()) {
            log.warn("[PlacementSync] Skipping — studentId is null | jobId={} status={}", jobId, newStatus);
            return Mono.empty();
        }

        Map<String, String> payload = Map.of(
                "studentId", studentId,
                "jobId",     jobId     != null ? jobId     : "",
                "status",    newStatus != null ? newStatus : "",
                "company",   company   != null ? company   : ""
        );

        log.info("[PlacementSync] Sending sync | studentId={} status={} jobId={}", studentId, newStatus, jobId);

        return webClient.post()
                .uri("/api/placement/internal/sync-status")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .onStatus(
                        status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .doOnNext(body -> log.error(
                                        "[PlacementSync] HTTP error {} | body={} | studentId={} status={}",
                                        response.statusCode(), body, studentId, newStatus))
                                .flatMap(body -> Mono.error(
                                        new RuntimeException("Placement sync HTTP error: " + response.statusCode())))
                )
                .bodyToMono(Void.class)
                .timeout(TIMEOUT)
                .retryWhen(Retry.fixedDelay(MAX_RETRIES, RETRY_DELAY)
                        .filter(ex -> !(ex instanceof WebClientResponseException.BadRequest))
                        .doBeforeRetry(signal -> log.warn(
                                "[PlacementSync] Retry #{} | studentId={} status={} | reason={}",
                                signal.totalRetries() + 1, studentId, newStatus,
                                signal.failure().getMessage())))
                .doOnSuccess(v -> log.info(
                        "[PlacementSync] ✅ Synced successfully | studentId={} status={}", studentId, newStatus))
                .doOnError(ex -> log.error(
                        "[PlacementSync] ❌ All retries exhausted | studentId={} status={} | error={}",
                        studentId, newStatus, ex.getMessage()))
                .onErrorResume(ex -> Mono.empty()); // never fail the recruiter response
    }
}
