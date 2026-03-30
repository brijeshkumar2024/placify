package com.placement.job.controller;

import com.placement.job.dto.request.NotesRequest;
import com.placement.job.dto.request.RateApplicationRequest;
import com.placement.job.dto.response.ApiResponse;
import com.placement.job.service.RecruiterService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private static final Logger log = LoggerFactory.getLogger(ApplicationController.class);
    private final RecruiterService recruiterService;

    public ApplicationController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    @PutMapping("/{id}/rating")
    public Mono<ResponseEntity<ApiResponse<Object>>> updateRating(
            @PathVariable String id,
            @Valid @RequestBody RateApplicationRequest req) {
        log.info("[ApplicationController] PUT /api/applications/{}/rating  value={}", id, req.getRating());
        return recruiterService.updateRating(id, req)
                .map(dto -> {
                    log.info("[ApplicationController] Rating saved — id={} rating={}", id, dto.getRating());
                    return ResponseEntity.ok(ApiResponse.success("Rating saved.", (Object) dto));
                })
                .onErrorResume(ex -> {
                    log.error("[ApplicationController] Rating failed — id={} error={}", id, ex.getMessage());
                    return Mono.just(ResponseEntity.badRequest()
                            .body(ApiResponse.error(ex.getMessage())));
                });
    }

    @PutMapping("/{id}/notes")
    public Mono<ResponseEntity<ApiResponse<Object>>> updateNotes(
            @PathVariable String id,
            @Valid @RequestBody NotesRequest req) {
        log.info("[ApplicationController] PUT /api/applications/{}/notes", id);
        return recruiterService.updateNotes(id, req)
                .map(dto -> {
                    log.info("[ApplicationController] Notes saved — id={}", id);
                    return ResponseEntity.ok(ApiResponse.success("Notes saved.", (Object) dto));
                })
                .onErrorResume(ex -> {
                    log.error("[ApplicationController] Notes failed — id={} error={}", id, ex.getMessage());
                    return Mono.just(ResponseEntity.badRequest()
                            .body(ApiResponse.error(ex.getMessage())));
                });
    }
}
