package com.placement.job.controller;
import com.placement.job.dto.request.CreateJobRequest;
import com.placement.job.dto.response.ApiResponse;
import com.placement.job.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }
    @GetMapping("/health")
    public Mono<ResponseEntity<ApiResponse<String>>> health() {
        return Mono.just(ResponseEntity.ok(ApiResponse.success("Job service is running.", null)));
    }
    @GetMapping
    public Mono<ResponseEntity<ApiResponse<Object>>> getAllJobs(
            @RequestHeader("Authorization") String token) {
        return jobService.getAllActiveJobs(token)
                .collectList()
                .map(jobs -> ResponseEntity.ok(ApiResponse.success("Jobs fetched.", (Object) jobs)));
    }
    @GetMapping("/{jobId}")
    public Mono<ResponseEntity<ApiResponse<Object>>> getJob(@PathVariable String jobId) {
        return jobService.getJobById(jobId)
                .map(job -> ResponseEntity.ok(ApiResponse.success("Job fetched.", (Object) job)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }
    @PostMapping
    public Mono<ResponseEntity<ApiResponse<Object>>> createJob(
            @RequestHeader("Authorization") String token,
            @RequestBody CreateJobRequest request) {
        return jobService.createJob(token, request)
                .map(job -> ResponseEntity.ok(ApiResponse.success("Job created.", (Object) job)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }
    @PostMapping("/{jobId}/apply")
    public Mono<ResponseEntity<ApiResponse<Object>>> applyToJob(
            @RequestHeader("Authorization") String token,
            @PathVariable String jobId) {
        return jobService.applyToJob(token, jobId)
                .map(app -> ResponseEntity.ok(ApiResponse.success("Applied successfully.", (Object) app)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }
    @GetMapping("/my-applications")
    public Mono<ResponseEntity<ApiResponse<Object>>> getMyApplications(
            @RequestHeader("Authorization") String token) {
        return jobService.getMyApplications(token)
                .collectList()
                .map(apps -> ResponseEntity.ok(ApiResponse.success("Applications fetched.", (Object) apps)));
    }
}
