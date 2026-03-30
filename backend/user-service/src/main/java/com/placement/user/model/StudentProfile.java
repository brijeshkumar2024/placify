package com.placement.user.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "student_profiles")
public class StudentProfile {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String email;
    private String fullName;
    private String phone;

    @JsonAlias({"rollNo", "roll_number"})
    private String rollNumber;

    private String branch;
    private double cgpa;
    private int graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private String resumeUrl;
    private List<String> skills;
    private List<Education> education;
    private List<Experience> experience;
    private ProfileStatus status;
    private int completionScore;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public StudentProfile() {
    }

    public StudentProfile(String id, String userId, String email, String fullName, String phone, String rollNumber,
                          String branch, double cgpa, int graduationYear, String linkedinUrl, String githubUrl,
                          String resumeUrl, List<String> skills, List<Education> education,
                          List<Experience> experience, ProfileStatus status, int completionScore,
                          Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.rollNumber = rollNumber;
        this.branch = branch;
        this.cgpa = cgpa;
        this.graduationYear = graduationYear;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
        this.resumeUrl = resumeUrl;
        this.skills = skills;
        this.education = education;
        this.experience = experience;
        this.status = status;
        this.completionScore = completionScore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public List<Education> getEducation() {
        return education;
    }

    public void setEducation(List<Education> education) {
        this.education = education;
    }

    public List<Experience> getExperience() {
        return experience;
    }

    public void setExperience(List<Experience> experience) {
        this.experience = experience;
    }

    public ProfileStatus getStatus() {
        return status;
    }

    public void setStatus(ProfileStatus status) {
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

    public enum ProfileStatus {
        INCOMPLETE,
        COMPLETE
    }

    public static class Education {
        private String degree;
        private String institution;
        private String year;
        private String percentage;

        public Education() {
        }

        public Education(String degree, String institution, String year, String percentage) {
            this.degree = degree;
            this.institution = institution;
            this.year = year;
            this.percentage = percentage;
        }

        public String getDegree() {
            return degree;
        }

        public void setDegree(String degree) {
            this.degree = degree;
        }

        public String getInstitution() {
            return institution;
        }

        public void setInstitution(String institution) {
            this.institution = institution;
        }

        public String getYear() {
            return year;
        }

        public void setYear(String year) {
            this.year = year;
        }

        public String getPercentage() {
            return percentage;
        }

        public void setPercentage(String percentage) {
            this.percentage = percentage;
        }
    }

    public static class Experience {
        private String title;
        private String company;
        private String duration;
        private String description;

        public Experience() {
        }

        public Experience(String title, String company, String duration, String description) {
            this.title = title;
            this.company = company;
            this.duration = duration;
            this.description = description;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCompany() {
            return company;
        }

        public void setCompany(String company) {
            this.company = company;
        }

        public String getDuration() {
            return duration;
        }

        public void setDuration(String duration) {
            this.duration = duration;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}

