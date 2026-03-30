package com.placement.job.dto.response;

import com.placement.job.model.Job;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

public class JobDto {
    private String id;
    private String title;
    private String company;
    private String description;
    private String location;
    private String ctc;
    private String jobType;
    private double minCgpa;
    private List<String> eligibleBranches;
    private int graduationYear;
    private List<String> requiredSkills;
    private int maxApplicants;
    private Instant deadline;
    private Job.JobStatus status;
    private int applicantCount;
    private Instant createdAt;

    /**
     * We intentionally keep the JSON property name "isApplied" so that the React
     * client can read it directly without post-processing. Jackson would otherwise
     * serialize the boolean field as "applied", which was causing the UI to lose
     * the applied state after a page refresh.
     */
    @JsonProperty("isApplied")
    private boolean applied;

    public static JobDto from(Job job, boolean isApplied) {
        JobDto dto = new JobDto();
        dto.id = job.getId();
        dto.title = job.getTitle();
        dto.company = job.getCompany();
        dto.description = job.getDescription();
        dto.location = job.getLocation();
        dto.ctc = job.getCtc();
        dto.jobType = job.getJobType();
        dto.minCgpa = job.getMinCgpa();
        dto.eligibleBranches = job.getEligibleBranches();
        dto.graduationYear = job.getGraduationYear();
        dto.requiredSkills = job.getRequiredSkills();
        dto.maxApplicants = job.getMaxApplicants();
        dto.deadline = job.getDeadline();
        dto.status = job.getStatus();
        dto.applicantCount = job.getApplicantCount();
        dto.createdAt = job.getCreatedAt();
        dto.applied = isApplied;
        return dto;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getCompany() { return company; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public String getCtc() { return ctc; }
    public String getJobType() { return jobType; }
    public double getMinCgpa() { return minCgpa; }
    public List<String> getEligibleBranches() { return eligibleBranches; }
    public int getGraduationYear() { return graduationYear; }
    public List<String> getRequiredSkills() { return requiredSkills; }
    public int getMaxApplicants() { return maxApplicants; }
    public Instant getDeadline() { return deadline; }
    public Job.JobStatus getStatus() { return status; }
    public int getApplicantCount() { return applicantCount; }
    public Instant getCreatedAt() { return createdAt; }

    @JsonProperty("isApplied")
    public boolean isApplied() { return applied; }
    public void setApplied(boolean applied) { this.applied = applied; }
}
