package com.placement.job.dto.request;

import jakarta.validation.constraints.NotBlank;

public class QuickInterviewRequest {
    @NotBlank
    private String candidateId;
    @NotBlank
    private String jobId;
    private String domain;
    private String difficulty;

    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
