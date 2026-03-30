package com.placement.user.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.util.List;

public class UpdateProfileRequest {
    private String fullName;
    private String phone;

    @JsonAlias({"rollNo", "roll_number"})
    private String rollNumber;

    private String branch;
    private double cgpa;
    private int graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private List<String> skills;
    private List<EducationDto> education;
    private List<ExperienceDto> experience;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, String phone, String rollNumber, String branch, double cgpa,
                                int graduationYear, String linkedinUrl, String githubUrl, List<String> skills,
                                List<EducationDto> education, List<ExperienceDto> experience) {
        this.fullName = fullName;
        this.phone = phone;
        this.rollNumber = rollNumber;
        this.branch = branch;
        this.cgpa = cgpa;
        this.graduationYear = graduationYear;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
        this.skills = skills;
        this.education = education;
        this.experience = experience;
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

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<EducationDto> getEducation() {
        return education;
    }

    public void setEducation(List<EducationDto> education) {
        this.education = education;
    }

    public List<ExperienceDto> getExperience() {
        return experience;
    }

    public void setExperience(List<ExperienceDto> experience) {
        this.experience = experience;
    }

    public static class EducationDto {
        private String degree;
        private String institution;
        private String year;
        private String percentage;

        public EducationDto() {
        }

        public EducationDto(String degree, String institution, String year, String percentage) {
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

    public static class ExperienceDto {
        private String title;
        private String company;
        private String duration;
        private String description;

        public ExperienceDto() {
        }

        public ExperienceDto(String title, String company, String duration, String description) {
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

