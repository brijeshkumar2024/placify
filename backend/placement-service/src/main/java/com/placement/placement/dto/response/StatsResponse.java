package com.placement.placement.dto.response;

public class StatsResponse {
    private long totalApplications;
    private long offersMade;
    private long placedStudents;
    private long shortlistedStudents;
    private long interviewStudents;
    private long rejectedStudents;
    private long activeDrives;
    private long upcomingDrives;
    private long totalDrives;
    private long onHoldStudents;
    private long atRiskStudents;

    public StatsResponse() {}

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long v) { this.totalApplications = v; }
    public long getOffersMade() { return offersMade; }
    public void setOffersMade(long v) { this.offersMade = v; }
    public long getPlacedStudents() { return placedStudents; }
    public void setPlacedStudents(long v) { this.placedStudents = v; }
    public long getShortlistedStudents() { return shortlistedStudents; }
    public void setShortlistedStudents(long v) { this.shortlistedStudents = v; }
    public long getInterviewStudents() { return interviewStudents; }
    public void setInterviewStudents(long v) { this.interviewStudents = v; }
    public long getRejectedStudents() { return rejectedStudents; }
    public void setRejectedStudents(long v) { this.rejectedStudents = v; }
    public long getActiveDrives() { return activeDrives; }
    public void setActiveDrives(long v) { this.activeDrives = v; }
    public long getUpcomingDrives() { return upcomingDrives; }
    public void setUpcomingDrives(long v) { this.upcomingDrives = v; }
    public long getTotalDrives() { return totalDrives; }
    public void setTotalDrives(long v) { this.totalDrives = v; }
    public long getOnHoldStudents() { return onHoldStudents; }
    public void setOnHoldStudents(long v) { this.onHoldStudents = v; }
    public long getAtRiskStudents() { return atRiskStudents; }
    public void setAtRiskStudents(long v) { this.atRiskStudents = v; }
}
