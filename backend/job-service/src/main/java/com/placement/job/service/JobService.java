package com.placement.job.service;
import com.placement.job.dto.request.CreateJobRequest;
import com.placement.job.exception.AppException;
import com.placement.job.model.Application;
import com.placement.job.model.Job;
import com.placement.job.repository.ApplicationRepository;
import com.placement.job.repository.JobRepository;
import com.placement.job.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JwtUtil jwtUtil;

    public JobService(JobRepository jobRepository, ApplicationRepository applicationRepository, JwtUtil jwtUtil) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.jwtUtil = jwtUtil;
    }
    public Flux<Job> getAllActiveJobs() {
        return jobRepository.findByStatus(Job.JobStatus.ACTIVE);
    }
    public Mono<Job> getJobById(String jobId) {
        return jobRepository.findById(jobId)
                .switchIfEmpty(Mono.error(new AppException("Job not found.", HttpStatus.NOT_FOUND)));
    }
    public Mono<Job> createJob(String token, CreateJobRequest request) {
        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setCtc(request.getCtc());
        job.setJobType(request.getJobType());
        job.setMinCgpa(request.getMinCgpa());
        job.setEligibleBranches(request.getEligibleBranches());
        job.setGraduationYear(request.getGraduationYear());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setMaxApplicants(request.getMaxApplicants());
        job.setDeadline(request.getDeadline());
        job.setStatus(Job.JobStatus.ACTIVE);
        job.setPostedBy(userId);
        job.setApplicantCount(0);
        return jobRepository.save(job);
    }
    public Mono<Application> applyToJob(String token, String jobId) {
        String studentId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return applicationRepository.existsByJobIdAndStudentId(jobId, studentId)
                .flatMap(exists -> {
                    if (exists) return Mono.error(new AppException(
                            "You have already applied to this job.", HttpStatus.CONFLICT));
                    return jobRepository.findById(jobId)
                            .switchIfEmpty(Mono.error(new AppException("Job not found.", HttpStatus.NOT_FOUND)))
                            .flatMap(job -> {
                                Application application = new Application();
                                application.setJobId(jobId);
                                application.setStudentId(studentId);
                                application.setCompany(job.getCompany());
                                application.setRole(job.getTitle());
                                application.setStatus(Application.ApplicationStatus.APPLIED);
                                application.setFitScore(75);
                                return applicationRepository.save(application)
                                        .flatMap(saved -> {
                                            job.setApplicantCount(job.getApplicantCount() + 1);
                                            return jobRepository.save(job).thenReturn(saved);
                                        });
                            });
                });
    }
    public Flux<Application> getMyApplications(String token) {
        String studentId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return applicationRepository.findByStudentId(studentId);
    }
}
