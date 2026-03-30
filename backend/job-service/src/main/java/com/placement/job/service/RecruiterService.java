package com.placement.job.service;

import com.placement.job.dto.request.ScheduleInterviewRequest;
import com.placement.job.dto.request.UpdateStatusRequest;
import com.placement.job.dto.request.QuickInterviewRequest;
import com.placement.job.dto.response.ApplicantDto;
import com.placement.job.dto.response.RecruiterStatsDto;
import com.placement.job.model.Application;
import com.placement.job.model.Interview;
import com.placement.job.model.Job;
import com.placement.job.repository.ApplicationRepository;
import com.placement.job.repository.InterviewRepository;
import com.placement.job.repository.JobRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecruiterService {
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    public RecruiterService(JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            InterviewRepository interviewRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
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
                .flatMap(app -> {
                    app.setStatus(Application.ApplicationStatus.valueOf(req.getStatus()));
                    app.setNotes(req.getNotes());
                    app.setRating(req.getRating());
                    app.setUpdatedAt(Instant.now());
                    System.out.println(app);
                    System.out.println(app.getStatus());
                    System.out.println(app.getAppliedAt());
                    return applicationRepository.save(app);
                });
    }

    public Mono<Interview> scheduleInterview(ScheduleInterviewRequest req) {
        Interview interview = new Interview();
        interview.setApplicationId(req.getApplicationId());
        interview.setScheduledAt(req.getScheduledAt());
        interview.setMeetingLink(req.getMeetingLink());
        interview.setStatus(Interview.InterviewStatus.SCHEDULED);
        return interviewRepository.save(interview);
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
