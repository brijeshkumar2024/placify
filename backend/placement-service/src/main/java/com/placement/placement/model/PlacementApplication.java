package com.placement.placement.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "placement_applications")
public class PlacementApplication {
    @Id
    private String id;
    private String jobId;
    private String studentId;
    private String studentEmail;
    private String studentName;
    private Double studentCgpa;
    private String studentBranch;
    private List<String> studentSkills;
    private String resumeUrl;
    private Map<String, String> customAnswers;
    private ApplicationStatus status;
    private Integer currentRound;
    private List<String> roundResults;
    private Integer fitScore;
    @CreatedDate
    private Instant appliedAt;
    private Instant updatedAt;

    public enum ApplicationStatus {
        APPLIED, SHORTLISTED, INTERVIEW, OFFER, REJECTED, HOLD
    }

    public PlacementApplication() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Double getStudentCgpa() { return studentCgpa; }
    public void setStudentCgpa(Double studentCgpa) { this.studentCgpa = studentCgpa; }
    public String getStudentBranch() { return studentBranch; }
    public void setStudentBranch(String studentBranch) { this.studentBranch = studentBranch; }
    public List<String> getStudentSkills() { return studentSkills; }
    public void setStudentSkills(List<String> studentSkills) { this.studentSkills = studentSkills; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public Map<String, String> getCustomAnswers() { return customAnswers; }
    public void setCustomAnswers(Map<String, String> customAnswers) { this.customAnswers = customAnswers; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public Integer getCurrentRound() { return currentRound; }
    public void setCurrentRound(Integer currentRound) { this.currentRound = currentRound; }
    public List<String> getRoundResults() { return roundResults; }
    public void setRoundResults(List<String> roundResults) { this.roundResults = roundResults; }
    public Integer getFitScore() { return fitScore; }
    public void setFitScore(Integer fitScore) { this.fitScore = fitScore; }
    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public void addRoundResult(String result) {
        if (this.roundResults == null) {
            this.roundResults = new ArrayList<>();
        }
        this.roundResults.add(result);
    }
}
