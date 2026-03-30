package com.placement.job.dto.response;

import java.util.List;

public class RecruiterStatsDto {
    public record Funnel(long applied, long shortlisted, long interview, long rejected, long hired) {}
    public record SkillCount(String skill, long count) {}

    private long totalJobs;
    private long totalApplicants;
    private double selectionRate;
    private List<SkillCount> topSkills;
    private Funnel funnel;

    public RecruiterStatsDto(long totalJobs, long totalApplicants, double selectionRate,
                             List<SkillCount> topSkills, Funnel funnel) {
        this.totalJobs = totalJobs;
        this.totalApplicants = totalApplicants;
        this.selectionRate = selectionRate;
        this.topSkills = topSkills;
        this.funnel = funnel;
    }

    public long getTotalJobs() { return totalJobs; }
    public long getTotalApplicants() { return totalApplicants; }
    public double getSelectionRate() { return selectionRate; }
    public List<SkillCount> getTopSkills() { return topSkills; }
    public Funnel getFunnel() { return funnel; }
}
