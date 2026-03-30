package com.placement.job.controller;

import com.placement.job.dto.response.ApiResponse;
import com.placement.job.model.Application;
import com.placement.job.model.Job;
import com.placement.job.repository.ApplicationRepository;
import com.placement.job.repository.JobRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tpo")
public class TpoController {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public TpoController(ApplicationRepository applicationRepository,
                         JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
    }

    /**
     * Returns all applications enriched with job details (title, company, ctc, location).
     * Used by TPO Placement Tracker page.
     */
    @GetMapping("/company/{id}")
    public Mono<ResponseEntity<ApiResponse<Object>>> getCompanyDetails(@PathVariable String id) {
        String companyName = URLDecoder.decode(id, StandardCharsets.UTF_8);
        // Escape regex special chars so company names like "C++" don't break the query
        String escaped = companyName.replaceAll("([\\\\^$.|?*+(){}\\[\\]])", "\\\\$1");

        return jobRepository.findByCompanyRegex(escaped)
                .collectList()
                .flatMap(jobs -> {
                    if (jobs.isEmpty()) {
                        return Mono.just(ResponseEntity.ok(
                                ApiResponse.success("Company details fetched.", (Object) Map.of(
                                        "companyName", companyName,
                                        "location", "",
                                        "roles", List.of(),
                                        "openings", 0,
                                        "applicants", 0,
                                        "ctc", "—",
                                        "applicantList", List.of()))));
                    }

                    List<String> roles = jobs.stream()
                            .map(j -> j.getTitle() != null ? j.getTitle() : "Role TBD")
                            .distinct().collect(Collectors.toList());

                    String location = jobs.stream()
                            .map(Job::getLocation).filter(l -> l != null && !l.isBlank())
                            .findFirst().orElse("—");

                    String ctc = jobs.stream()
                            .map(Job::getCtc).filter(c -> c != null && !c.isBlank())
                            .findFirst().orElse("—");

                    long openings = jobs.size();
                    long totalApplicants = jobs.stream().mapToLong(Job::getApplicantCount).sum();

                    List<String> jobIds = jobs.stream().map(Job::getId).collect(Collectors.toList());

                    return applicationRepository.findAllByOrderByAppliedAtDesc()
                            .filter(app -> jobIds.contains(app.getJobId()))
                            .map(app -> {
                                Map<String, Object> a = new LinkedHashMap<>();
                                a.put("studentId",    app.getStudentId());
                                a.put("studentName",  app.getName());
                                a.put("studentEmail", app.getEmail());
                                a.put("status",       app.getStatus());
                                a.put("role",         app.getRole());
                                return a;
                            })
                            .collectList()
                            .map(applicantList -> {
                                Map<String, Object> result = new LinkedHashMap<>();
                                result.put("companyName",   companyName);
                                result.put("location",      location);
                                result.put("roles",         roles);
                                result.put("openings",      openings);
                                result.put("applicants",    totalApplicants);
                                result.put("ctc",           ctc);
                                result.put("applicantList", applicantList);
                                return ResponseEntity.ok(ApiResponse.success("Company details fetched.", (Object) result));
                            });
                });
    }

    @GetMapping("/applications")
    public Mono<ResponseEntity<ApiResponse<Object>>> getAllApplications(
            @RequestParam(required = false) String status) {

        var apps = status != null && !status.isBlank()
                ? applicationRepository.findByStatus(Application.ApplicationStatus.valueOf(status.toUpperCase()))
                : applicationRepository.findAllByOrderByAppliedAtDesc();

        return apps
                .flatMap(app -> jobRepository.findById(app.getJobId())
                        .defaultIfEmpty(new Job())
                        .map(job -> {
                            Map<String, Object> enriched = new LinkedHashMap<>();
                            enriched.put("id",            app.getId());
                            enriched.put("jobId",         app.getJobId());
                            enriched.put("studentId",     app.getStudentId());
                            enriched.put("studentName",   app.getName());
                            enriched.put("studentEmail",  app.getEmail());
                            enriched.put("studentCgpa",   app.getCgpa());
                            enriched.put("studentSkills", app.getSkills());
                            enriched.put("status",        app.getStatus());
                            enriched.put("fitScore",      app.getFitScore());
                            enriched.put("rating",        app.getRating());
                            enriched.put("notes",         app.getNotes());
                            enriched.put("appliedAt",     app.getAppliedAt());
                            enriched.put("updatedAt",     app.getUpdatedAt());
                            // job details
                            enriched.put("jobTitle",      job.getTitle());
                            enriched.put("company",       job.getCompany() != null ? job.getCompany() : app.getCompany());
                            enriched.put("ctc",           job.getCtc());
                            enriched.put("location",      job.getLocation());
                            enriched.put("jobType",       job.getJobType());
                            return enriched;
                        }))
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("Applications fetched.", (Object) list)));
    }
}
