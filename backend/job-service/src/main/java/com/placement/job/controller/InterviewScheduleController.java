package com.placement.job.controller;

import com.placement.job.dto.request.ScheduleInterviewRequest;
import com.placement.job.dto.response.ApiResponse;
import com.placement.job.service.RecruiterService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/interviews")
public class InterviewScheduleController {

    private static final Logger log = LoggerFactory.getLogger(InterviewScheduleController.class);

    private final RecruiterService recruiterService;

    public InterviewScheduleController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    @PostMapping("/schedule")
    public Mono<ResponseEntity<ApiResponse<Object>>> scheduleInterview(@Valid @RequestBody ScheduleInterviewRequest req) {
        log.info("[InterviewSchedule] POST /api/interviews/schedule | applicationId={} studentEmail={} dateTime={}",
                req.getApplicationId(), req.getStudentEmail(), req.getDateTime());

        if (!StringUtils.hasText(req.getApplicationId())
                || !StringUtils.hasText(req.getStudentEmail())
                || req.getDateTime() == null) {
            return Mono.just(ResponseEntity.badRequest().body(
                    ApiResponse.error("Missing fields: applicationId, studentEmail, and dateTime are required.")));
        }

        return recruiterService.scheduleInterview(req)
                .map(saved -> ResponseEntity.ok(ApiResponse.success("Interview scheduled.", (Object) saved)));
    }
}
