package com.placement.user.dto.response;

import com.placement.user.model.StudentProfile;

import java.time.Instant;
import java.util.List;

public class StudentProfileResponse {
    private String id;
    private String userId;
    private String email;
    private String fullName;
    private String phone;
    private String rollNumber;
    private String branch;
    private double cgpa;
    private int graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private String resumeUrl;
    private List<String> skills;
    private List<StudentProfile.Education> education;
    private List<StudentProfile.Experience> experience;
    private StudentProfile.ProfileStatus status;
    private int completionScore;
    private Instant createdAt;
    private Instant updatedAt;

    public StudentProfileResponse() {
    }

    public static StudentProfileResponse fromProfile(StudentProfile profile) {
        StudentProfileResponse response = new StudentProfileResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUserId());
        response.setEmail(profile.getEmail());
        response.setFullName(profile.getFullName());
        response.setPhone(profile.getPhone());
        response.setRollNumber(profile.getRollNumber());
        response.setBranch(profile.getBranch());
        response.setCgpa(profile.getCgpa());
        response.setGraduationYear(profile.getGraduationYear());
        response.setLinkedinUrl(profile.getLinkedinUrl());
        response.setGithubUrl(profile.getGithubUrl());
        response.setResumeUrl(profile.getResumeUrl());
        response.setSkills(profile.getSkills());
        response.setEducation(profile.getEducation());
        response.setExperience(profile.getExperience());
        response.setStatus(profile.getStatus());
        response.setCompletionScore(profile.getCompletionScore());
        response.setCreatedAt(profile.getCreatedAt());
        response.setUpdatedAt(profile.getUpdatedAt());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public double getCgpa() {
        return cgpa;
    }

    public void setCgpa(double cgpa) {
        this.cgpa = cgpa;
    }

    public int getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(int graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<StudentProfile.Education> getEducation() {
        return education;
    }

    public void setEducation(List<StudentProfile.Education> education) {
        this.education = education;
    }

    public List<StudentProfile.Experience> getExperience() {
        return experience;
    }

    public void setExperience(List<StudentProfile.Experience> experience) {
        this.experience = experience;
    }

    public StudentProfile.ProfileStatus getStatus() {
        return status;
    }

    public void setStatus(StudentProfile.ProfileStatus status) {
        this.status = status;
    }

    public int getCompletionScore() {
        return completionScore;
    }

    public void setCompletionScore(int completionScore) {
        this.completionScore = completionScore;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
