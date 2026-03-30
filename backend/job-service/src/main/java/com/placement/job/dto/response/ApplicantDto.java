package com.placement.job.dto.response;

import com.placement.job.model.Application;
import java.time.Instant;
import java.util.List;

public class ApplicantDto {
    private String id;
    private String name;
    private String email;
    private Double cgpa;
    private List<String> skills;
    private String resumeUrl;
    private Application.ApplicationStatus status;
    private Integer rating;
    private String notes;
    private Integer matchScore;
    private Instant appliedAt;

    public static ApplicantDto from(Application a) {
        ApplicantDto dto = new ApplicantDto();
        dto.id = a.getId();
        dto.name = a.getName();
        dto.email = a.getEmail();
        dto.cgpa = a.getCgpa();
        dto.skills = a.getSkills();
        dto.resumeUrl = a.getResumeUrl();
        dto.status = a.getStatus();
        dto.rating = a.getRating();
        dto.notes = a.getNotes();
        dto.matchScore = a.getMatchScore();
        dto.appliedAt = a.getAppliedAt();
        return dto;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Double getCgpa() { return cgpa; }
    public List<String> getSkills() { return skills; }
    public String getResumeUrl() { return resumeUrl; }
    public Application.ApplicationStatus getStatus() { return status; }
    public Integer getRating() { return rating; }
    public String getNotes() { return notes; }
    public Integer getMatchScore() { return matchScore; }
    public Instant getAppliedAt() { return appliedAt; }
}
