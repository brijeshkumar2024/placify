package com.placement.placement.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "student_placement_status")
public class StudentPlacementStatus {
    @Id
    private String id;
    private String studentId;
    private boolean placed;
    private String placedCompany;
    private Double placedCtc;
    private boolean onHold;
    private String holdReason;
    private List<String> activeApplications;
    private Integer totalApplications;
    private Integer shortlistedCount;
    private Integer interviewCount;
    private Integer offersReceived;
    private Integer rejectedCount;
    @CreatedDate
    private Instant createdAt;

    public StudentPlacementStatus() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public boolean isPlaced() { return placed; }
    public void setPlaced(boolean placed) { this.placed = placed; }
    public String getPlacedCompany() { return placedCompany; }
    public void setPlacedCompany(String placedCompany) { this.placedCompany = placedCompany; }
    public Double getPlacedCtc() { return placedCtc; }
    public void setPlacedCtc(Double placedCtc) { this.placedCtc = placedCtc; }
    public boolean isOnHold() { return onHold; }
    public void setOnHold(boolean onHold) { this.onHold = onHold; }
    public String getHoldReason() { return holdReason; }
    public void setHoldReason(String holdReason) { this.holdReason = holdReason; }
    public List<String> getActiveApplications() { return activeApplications; }
    public void setActiveApplications(List<String> activeApplications) { this.activeApplications = activeApplications; }
    public Integer getTotalApplications() { return totalApplications; }
    public void setTotalApplications(Integer totalApplications) { this.totalApplications = totalApplications; }
    public Integer getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(Integer shortlistedCount) { this.shortlistedCount = shortlistedCount; }
    public Integer getInterviewCount() { return interviewCount; }
    public void setInterviewCount(Integer interviewCount) { this.interviewCount = interviewCount; }
    public Integer getOffersReceived() { return offersReceived; }
    public void setOffersReceived(Integer offersReceived) { this.offersReceived = offersReceived; }
    public Integer getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(Integer rejectedCount) { this.rejectedCount = rejectedCount; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
