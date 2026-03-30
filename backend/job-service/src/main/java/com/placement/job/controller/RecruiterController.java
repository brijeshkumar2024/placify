package com.placement.job.controller;

import com.placement.job.dto.request.ScheduleInterviewRequest;
import com.placement.job.dto.request.UpdateStatusRequest;
import com.placement.job.dto.request.QuickInterviewRequest;
import com.placement.job.dto.response.ApiResponse;
import com.placement.job.model.Job;
import com.placement.job.service.RecruiterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/recruiter")
public class RecruiterController {

    private final RecruiterService recruiterService;

    public RecruiterController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    @GetMapping("/dashboard/stats")
    public Mono<ResponseEntity<ApiResponse<Object>>> stats(@RequestParam String recruiterId) {
        return recruiterService.getStats(recruiterId)
                .map(dto -> ResponseEntity.ok(ApiResponse.success("Stats fetched.", (Object) dto)));
    }

    @GetMapping("/jobs/{recruiterId}")
    public Mono<ResponseEntity<ApiResponse<Object>>> jobs(
            @PathVariable String recruiterId,
            @RequestParam(required = false) Job.JobStatus status) {
        return recruiterService.getRecruiterJobs(recruiterId, status)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("Jobs fetched.", (Object) list)));
    }

    @GetMapping("/applications/job/{jobId}")
    public Mono<ResponseEntity<ApiResponse<Object>>> applicants(@PathVariable String jobId) {
        return recruiterService.getApplicantsForJob(jobId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("Applicants fetched.", (Object) list)));
    }

    @PutMapping("/applications/status")
    public Mono<ResponseEntity<ApiResponse<Object>>> updateStatus(@Valid @RequestBody UpdateStatusRequest req) {
        return recruiterService.updateStatus(req)
                .map(app -> ResponseEntity.ok(ApiResponse.success("Status updated.", (Object) app)));
    }

    @PostMapping("/interview/schedule")
    public Mono<ResponseEntity<ApiResponse<Object>>> scheduleInterview(@Valid @RequestBody ScheduleInterviewRequest req) {
        return recruiterService.scheduleInterview(req)
                .map(intv -> ResponseEntity.ok(ApiResponse.success("Interview scheduled.", (Object) intv)));
    }

    @PostMapping("/interview/start")
    public Mono<ResponseEntity<ApiResponse<Object>>> startQuickInterview(@Valid @RequestBody QuickInterviewRequest req) {
        return recruiterService.startQuickInterview(req)
                .map(intv -> ResponseEntity.ok(ApiResponse.success("Quick interview started.", (Object) intv)));
    }

    @GetMapping("/applications/job/{jobId}/counts")
    public Mono<ResponseEntity<ApiResponse<Object>>> counts(@PathVariable String jobId) {
        return recruiterService.getStatusCounts(jobId)
                .map(map -> ResponseEntity.ok(ApiResponse.success("Counts fetched.", (Object) map)));
    }
}
