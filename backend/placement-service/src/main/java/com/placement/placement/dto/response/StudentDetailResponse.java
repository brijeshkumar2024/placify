package com.placement.placement.dto.response;

import com.placement.placement.model.PlacementApplication;
import com.placement.placement.model.StudentPlacementStatus;

import java.time.Instant;
import java.util.List;

public class StudentDetailResponse {

    private String studentId;
    private String studentName;
    private String studentEmail;
    private Double studentCgpa;
    private String studentBranch;

    // aggregate stats
    private int totalApplications;
    private int shortlistedCount;
    private int interviewCount;
    private int offersReceived;
    private int rejectedCount;
    private boolean placed;
    private String placedCompany;
    private Double placedCtc;
    private boolean onHold;
    private String holdReason;

    // full application history
    private List<ApplicationSummary> applications;

    public StudentDetailResponse() {}

    // ── nested DTO ────────────────────────────────────────────────────────────
    public static class ApplicationSummary {
        private String applicationId;
        private String jobId;
        private String company;
        private String role;
        private PlacementApplication.ApplicationStatus status;
        private Integer currentRound;
        private Integer fitScore;
        private Instant appliedAt;
        private Instant updatedAt;

        public ApplicationSummary() {}

        public static ApplicationSummary from(PlacementApplication a) {
            ApplicationSummary s = new ApplicationSummary();
            s.applicationId = a.getId();
            s.jobId         = a.getJobId();
            s.company       = a.getStudentBranch(); // will be overridden by caller if needed
            s.status        = a.getStatus();
            s.currentRound  = a.getCurrentRound();
            s.fitScore      = a.getFitScore();
            s.appliedAt     = a.getAppliedAt();
            s.updatedAt     = a.getUpdatedAt();
            return s;
        }

        public String getApplicationId() { return applicationId; }
        public String getJobId() { return jobId; }
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public PlacementApplication.ApplicationStatus getStatus() { return status; }
        public Integer getCurrentRound() { return currentRound; }
        public Integer getFitScore() { return fitScore; }
        public Instant getAppliedAt() { return appliedAt; }
        public Instant getUpdatedAt() { return updatedAt; }
    }

    // ── factory ───────────────────────────────────────────────────────────────
    public static StudentDetailResponse from(StudentPlacementStatus status,
                                              List<ApplicationSummary> apps,
                                              String name, String email,
                                              Double cgpa, String branch) {
        StudentDetailResponse r = new StudentDetailResponse();
        r.studentId          = status.getStudentId();
        r.studentName        = name;
        r.studentEmail       = email;
        r.studentCgpa        = cgpa;
        r.studentBranch      = branch;
        r.totalApplications  = status.getTotalApplications()  != null ? status.getTotalApplications()  : 0;
        r.shortlistedCount   = status.getShortlistedCount()   != null ? status.getShortlistedCount()   : 0;
        r.interviewCount     = status.getInterviewCount()     != null ? status.getInterviewCount()     : 0;
        r.offersReceived     = status.getOffersReceived()     != null ? status.getOffersReceived()     : 0;
        r.rejectedCount      = status.getRejectedCount()      != null ? status.getRejectedCount()      : 0;
        r.placed             = status.isPlaced();
        r.placedCompany      = status.getPlacedCompany();
        r.placedCtc          = status.getPlacedCtc();
        r.onHold             = status.isOnHold();
        r.holdReason         = status.getHoldReason();
        r.applications       = apps;
        return r;
    }

    public String getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getStudentEmail() { return studentEmail; }
    public Double getStudentCgpa() { return studentCgpa; }
    public String getStudentBranch() { return studentBranch; }
    public int getTotalApplications() { return totalApplications; }
    public int getShortlistedCount() { return shortlistedCount; }
    public int getInterviewCount() { return interviewCount; }
    public int getOffersReceived() { return offersReceived; }
    public int getRejectedCount() { return rejectedCount; }
    public boolean isPlaced() { return placed; }
    public String getPlacedCompany() { return placedCompany; }
    public Double getPlacedCtc() { return placedCtc; }
    public boolean isOnHold() { return onHold; }
    public String getHoldReason() { return holdReason; }
    public List<ApplicationSummary> getApplications() { return applications; }
}
