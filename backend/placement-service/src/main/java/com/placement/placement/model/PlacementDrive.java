package com.placement.placement.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "placement_drives")
public class PlacementDrive {
    @Id
    private String id;
    private String company;
    private String jobId;
    private String tpoId;
    private String collegeId;
    private EligibilityRules eligibilityRules;
    private List<String> rounds;
    private Integer currentRound;
    private DriveStatus status;
    private List<String> registeredStudents;
    private List<String> placedStudents;
    @CreatedDate
    private Instant createdAt;
    private Instant deadline;

    public enum DriveStatus { UPCOMING, ACTIVE, COMPLETED }

    public static class EligibilityRules {
        private Double minCgpa;
        private List<String> branches;
        private Integer graduationYear;
        private Integer maxBacklogs;

        public EligibilityRules() {}

        public Double getMinCgpa() { return minCgpa; }
        public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
        public List<String> getBranches() { return branches; }
        public void setBranches(List<String> branches) { this.branches = branches; }
        public Integer getGraduationYear() { return graduationYear; }
        public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
        public Integer getMaxBacklogs() { return maxBacklogs; }
        public void setMaxBacklogs(Integer maxBacklogs) { this.maxBacklogs = maxBacklogs; }
    }

    public PlacementDrive() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public String getTpoId() { return tpoId; }
    public void setTpoId(String tpoId) { this.tpoId = tpoId; }
    public String getCollegeId() { return collegeId; }
    public void setCollegeId(String collegeId) { this.collegeId = collegeId; }
    public EligibilityRules getEligibilityRules() { return eligibilityRules; }
    public void setEligibilityRules(EligibilityRules eligibilityRules) { this.eligibilityRules = eligibilityRules; }
    public List<String> getRounds() { return rounds; }
    public void setRounds(List<String> rounds) { this.rounds = rounds; }
    public Integer getCurrentRound() { return currentRound; }
    public void setCurrentRound(Integer currentRound) { this.currentRound = currentRound; }
    public DriveStatus getStatus() { return status; }
    public void setStatus(DriveStatus status) { this.status = status; }
    public List<String> getRegisteredStudents() { return registeredStudents; }
    public void setRegisteredStudents(List<String> registeredStudents) { this.registeredStudents = registeredStudents; }
    public List<String> getPlacedStudents() { return placedStudents; }
    public void setPlacedStudents(List<String> placedStudents) { this.placedStudents = placedStudents; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getDeadline() { return deadline; }
    public void setDeadline(Instant deadline) { this.deadline = deadline; }
}
