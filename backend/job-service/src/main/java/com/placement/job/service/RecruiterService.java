package com.placement.job.service;

import com.placement.job.dto.request.NotesRequest;
import com.placement.job.dto.request.RateApplicationRequest;
import com.placement.job.dto.request.ScheduleInterviewRequest;
import com.placement.job.dto.request.UpdateStatusRequest;
import com.placement.job.dto.request.QuickInterviewRequest;
import com.placement.job.dto.response.ApplicantDto;
import com.placement.job.dto.response.RecruiterStatsDto;
import com.placement.job.exception.AppException;
import com.placement.job.model.Application;
import com.placement.job.model.Interview;
import com.placement.job.model.Job;
import com.placement.job.repository.ApplicationRepository;
import com.placement.job.repository.InterviewRepository;
import com.placement.job.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecruiterService {
    private static final Logger log = LoggerFactory.getLogger(RecruiterService.class);
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final PlacementSyncService placementSyncService;
    private final EmailService emailService;

    public RecruiterService(JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            InterviewRepository interviewRepository,
                            PlacementSyncService placementSyncService,
                            EmailService emailService) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.placementSyncService = placementSyncService;
        this.emailService = emailService;
    }

    public Flux<Job> getRecruiterJobs(String recruiterId, Job.JobStatus status) {
        if (status == null) return jobRepository.findByPostedBy(recruiterId);
        return jobRepository.findByPostedByAndStatus(recruiterId, status);
    }

    public Flux<ApplicantDto> getApplicantsForJob(String jobId) {
        return applicationRepository.findByJobId(jobId)
                .map(ApplicantDto::from);
    }

    public Mono<Application> updateStatus(UpdateStatusRequest req) {
        return applicationRepository.findById(req.getApplicationId())
                .switchIfEmpty(Mono.error(new RuntimeException("Application not found: " + req.getApplicationId())))
                .flatMap(app -> {
                    app.setStatus(Application.ApplicationStatus.valueOf(req.getStatus()));
                    // Only overwrite notes/rating if explicitly provided — never null-wipe saved values
                    if (req.getNotes() != null) app.setNotes(req.getNotes());
                    if (req.getRating() != null) app.setRating(req.getRating());
                    app.setUpdatedAt(Instant.now());
                    return applicationRepository.save(app);
                })
                .flatMap(saved ->
                    placementSyncService.syncStatusUpdate(
                            saved.getStudentId(),
                            saved.getJobId(),
                            req.getStatus(),
                            saved.getCompany())
                    .thenReturn(saved)
                );
    }

    public Mono<Interview> scheduleInterview(ScheduleInterviewRequest req) {
        if (!StringUtils.hasText(req.getApplicationId())
                || !StringUtils.hasText(req.getStudentEmail())
                || req.getDateTime() == null) {
            return Mono.error(new AppException(
                    "Missing fields: applicationId, studentEmail, and dateTime are required.",
                    HttpStatus.BAD_REQUEST));
        }

        final Instant scheduledAt = req.toInstant();
        log.info("[InterviewSchedule] Scheduling | applicationId={} studentEmail={} dateTime={}",
                req.getApplicationId(), req.getStudentEmail(), req.getDateTime());

        return applicationRepository.findById(req.getApplicationId())
                .switchIfEmpty(Mono.error(new AppException(
                        "Application not found: " + req.getApplicationId(),
                        HttpStatus.NOT_FOUND)))
                .flatMap(app -> {
                    app.setStatus(Application.ApplicationStatus.INTERVIEW);
                    app.setInterviewDateTime(scheduledAt);
                    app.setUpdatedAt(Instant.now());

                    if (!StringUtils.hasText(app.getStudentEmail())) {
                        app.setStudentEmail(req.getStudentEmail());
                    }
                    if (!StringUtils.hasText(app.getEmail())) {
                        app.setEmail(req.getStudentEmail());
                    }

                    return applicationRepository.save(app);
                })
                .flatMap(savedApp -> {
                    Interview interview = new Interview();
                    interview.setApplicationId(savedApp.getId());
                    interview.setCandidateId(savedApp.getStudentId());
                    interview.setJobId(savedApp.getJobId());
                    interview.setScheduledAt(scheduledAt);
                    interview.setMeetingLink(req.getMeetingLink());
                    interview.setStatus(Interview.InterviewStatus.SCHEDULED);

                    String emailToUse = resolveStudentEmail(savedApp, req);
                    String companyName = resolveCompany(savedApp, req);
                    String roleName = resolveRole(savedApp, req);

                    return interviewRepository.save(interview)
                            .flatMap(savedInterview -> placementSyncService
                                    .syncStatusUpdate(
                                            savedApp.getStudentId(),
                                            savedApp.getJobId(),
                                            Application.ApplicationStatus.INTERVIEW.name(),
                                            companyName)
                                    .then(emailService.sendInterviewScheduled(
                                            emailToUse,
                                            companyName,
                                            roleName,
                                            scheduledAt,
                                            req.getMessage()))
                                    .thenReturn(savedInterview));
                })
                .doOnSuccess(saved -> log.info(
                        "[InterviewSchedule] Success | interviewId={} applicationId={} scheduledAt={}",
                        saved.getId(), saved.getApplicationId(), saved.getScheduledAt()))
                .doOnError(ex -> log.error(
                        "[InterviewSchedule] Failed | applicationId={} reason={}",
                        req.getApplicationId(), ex.getMessage()));
    }

    private String resolveStudentEmail(Application app, ScheduleInterviewRequest req) {
        if (StringUtils.hasText(req.getStudentEmail())) {
            return req.getStudentEmail();
        }
        if (StringUtils.hasText(app.getStudentEmail())) {
            return app.getStudentEmail();
        }
        return app.getEmail();
    }

    private String resolveCompany(Application app, ScheduleInterviewRequest req) {
        return StringUtils.hasText(req.getCompany()) ? req.getCompany() : app.getCompany();
    }

    private String resolveRole(Application app, ScheduleInterviewRequest req) {
        return StringUtils.hasText(req.getRole()) ? req.getRole() : app.getRole();
    }

    public Mono<Interview> startQuickInterview(QuickInterviewRequest req) {
        Interview interview = new Interview();
        interview.setApplicationId(req.getCandidateId());
        interview.setCandidateId(req.getCandidateId());
        interview.setJobId(req.getJobId());
        interview.setDomain(req.getDomain());
        interview.setDifficulty(req.getDifficulty());
        interview.setQuestions(java.util.List.of(
                "Explain a recent project you are proud of.",
                "Solve a simple DSA problem: two-sum in O(n).",
                "Describe how you debug performance bottlenecks."
        ));
        interview.setStatus(Interview.InterviewStatus.SCHEDULED);
        return interviewRepository.save(interview);
    }

    public Mono<ApplicantDto> updateRating(String applicationId, RateApplicationRequest req) {
        log.info("[Rating] id={} rating={}", applicationId, req.getRating());
        return applicationRepository.findById(applicationId)
                .switchIfEmpty(Mono.error(new RuntimeException("Application not found: " + applicationId)))
                .flatMap(app -> {
                    app.setRating(req.getRating());
                    app.setUpdatedAt(Instant.now());
                    return applicationRepository.save(app);
                })
                .map(saved -> {
                    log.info("[Rating] Saved — id={} rating={}", saved.getId(), saved.getRating());
                    return ApplicantDto.from(saved);
                });
    }

    public Mono<ApplicantDto> updateNotes(String applicationId, NotesRequest req) {
        log.info("[Notes] id={} notes_length={}", applicationId, req.getNotes() == null ? 0 : req.getNotes().length());
        return applicationRepository.findById(applicationId)
                .switchIfEmpty(Mono.error(new RuntimeException("Application not found: " + applicationId)))
                .flatMap(app -> {
                    app.setNotes(req.getNotes());
                    app.setUpdatedAt(Instant.now());
                    return applicationRepository.save(app);
                })
                .map(saved -> {
                    log.info("[Notes] Saved — id={}", saved.getId());
                    return ApplicantDto.from(saved);
                });
    }

    public Mono<java.util.Map<String, Long>> getStatusCounts(String jobId) {
        return Mono.zip(
                applicationRepository.countByJobIdAndStatus(jobId, Application.ApplicationStatus.APPLIED),
                applicationRepository.countByJobIdAndStatus(jobId, Application.ApplicationStatus.SHORTLISTED),
                applicationRepository.countByJobIdAndStatus(jobId, Application.ApplicationStatus.INTERVIEW),
                applicationRepository.countByJobIdAndStatus(jobId, Application.ApplicationStatus.REJECTED),
                applicationRepository.countByJobIdAndStatus(jobId, Application.ApplicationStatus.HIRED)
        ).map(t -> Map.of(
                "applied", t.getT1(),
                "shortlisted", t.getT2(),
                "interview", t.getT3(),
                "rejected", t.getT4(),
                "hired", t.getT5()
        ));
    }

    public Mono<RecruiterStatsDto> getStats(String recruiterId) {
        Mono<Long> totalJobs = jobRepository.findByPostedBy(recruiterId).count();
        Mono<Long> totalApplicants = jobRepository.findByPostedBy(recruiterId)
                .flatMap(job -> applicationRepository.countByJobId(job.getId()))
                .reduce(0L, Long::sum);

        Mono<Map<Application.ApplicationStatus, Long>> statusCounts = jobRepository.findByPostedBy(recruiterId)
                .flatMap(job -> applicationRepository.findByJobId(job.getId()))
                .collect(Collectors.groupingBy(Application::getStatus, Collectors.counting()));

        Mono<List<RecruiterStatsDto.SkillCount>> topSkills = jobRepository.findByPostedBy(recruiterId)
                .flatMap(job -> applicationRepository.findByJobId(job.getId()))
                .flatMapIterable(app -> app.getSkills() == null ? List.of() : app.getSkills())
                .collect(Collectors.groupingBy(skill -> skill, Collectors.counting()))
                .map(map -> map.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .limit(5)
                        .map(e -> new RecruiterStatsDto.SkillCount(e.getKey(), e.getValue()))
                        .collect(Collectors.toList()));

        return Mono.zip(totalJobs, totalApplicants, statusCounts.defaultIfEmpty(Map.of()), topSkills.defaultIfEmpty(List.of()))
                .map(tuple -> {
                    long jobs = tuple.getT1();
                    long applicants = tuple.getT2();
                    Map<Application.ApplicationStatus, Long> sc = tuple.getT3();
                    List<RecruiterStatsDto.SkillCount> skills = tuple.getT4();
                    long hired = sc.getOrDefault(Application.ApplicationStatus.OFFER, 0L)
                            + sc.getOrDefault(Application.ApplicationStatus.HIRED, 0L);
                    double selectionRate = applicants == 0 ? 0 : (double) hired / applicants * 100.0;
                    RecruiterStatsDto.Funnel funnel = new RecruiterStatsDto.Funnel(
                            sc.getOrDefault(Application.ApplicationStatus.APPLIED, 0L),
                            sc.getOrDefault(Application.ApplicationStatus.SHORTLISTED, 0L),
                            sc.getOrDefault(Application.ApplicationStatus.INTERVIEW, 0L),
                            sc.getOrDefault(Application.ApplicationStatus.REJECTED, 0L),
                            sc.getOrDefault(Application.ApplicationStatus.HIRED, 0L)
                    );
                    return new RecruiterStatsDto(jobs, applicants, selectionRate, skills, funnel);
                });
    }
}
