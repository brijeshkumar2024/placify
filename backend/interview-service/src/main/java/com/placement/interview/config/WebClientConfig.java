package com.placement.interview.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Configuration
public class WebClientConfig {

    private static final Logger log = LoggerFactory.getLogger(WebClientConfig.class);

    @Value("${nvidia.api.base-url}")
    private String nvidiaBaseUrl;

    @Value("${nvidia.api.key}")
    private String nvidiaApiKey;

    @Bean
    public WebClient nvidiaWebClient() {
        // Fail fast — do not start with a missing or placeholder key
        if (nvidiaApiKey == null || nvidiaApiKey.isBlank() || nvidiaApiKey.equals("MISSING_KEY")) {
            throw new IllegalStateException(
                "[interview-service] NVIDIA_API_KEY environment variable is not set. " +
                "Set it before starting: export NVIDIA_API_KEY=nvapi-xxxx");
        }

        String maskedKey = nvidiaApiKey.substring(0, Math.min(12, nvidiaApiKey.length())) + "...";
        log.info("[interview-service] NVIDIA WebClient initialised → base={} key={}", nvidiaBaseUrl, maskedKey);

        return WebClient.builder()
                .baseUrl(nvidiaBaseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + nvidiaApiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .codecs(config -> config.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                .filter(logRequest())
                .filter(logResponse())
                .build();
    }

    // Log every outgoing request (method + URI only, never logs the key)
    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(req -> {
            log.debug("[NVIDIA] --> {} {}", req.method(), req.url());
            return Mono.just(req);
        });
    }

    // Log every response status
    private ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(res -> {
            log.debug("[NVIDIA] <-- HTTP {}", res.statusCode());
            return Mono.just(res);
        });
    }
}
