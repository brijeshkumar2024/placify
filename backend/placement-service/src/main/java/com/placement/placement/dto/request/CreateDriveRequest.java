package com.placement.placement.dto.request;

import java.time.Instant;
import java.util.List;

public class CreateDriveRequest {
    private String company;
    private String jobId;
    private String tpoId;
    private String collegeId;
    private Double minCgpa;
    private List<String> branches;
    private Integer graduationYear;
    private Integer maxBacklogs;
    private List<String> rounds;
    private Instant deadline;

    public CreateDriveRequest() {}

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public String getTpoId() { return tpoId; }
    public void setTpoId(String tpoId) { this.tpoId = tpoId; }
    public String getCollegeId() { return collegeId; }
    public void setCollegeId(String collegeId) { this.collegeId = collegeId; }
    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
    public List<String> getBranches() { return branches; }
    public void setBranches(List<String> branches) { this.branches = branches; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public Integer getMaxBacklogs() { return maxBacklogs; }
    public void setMaxBacklogs(Integer maxBacklogs) { this.maxBacklogs = maxBacklogs; }
    public List<String> getRounds() { return rounds; }
    public void setRounds(List<String> rounds) { this.rounds = rounds; }
    public Instant getDeadline() { return deadline; }
    public void setDeadline(Instant deadline) { this.deadline = deadline; }
}
