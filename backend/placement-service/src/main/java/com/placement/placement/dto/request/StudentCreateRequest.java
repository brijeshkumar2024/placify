package com.placement.placement.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public class StudentCreateRequest {
    @NotBlank
    private String fullName;
    @Email
    private String email;
    @NotBlank
    private String rollNumber;
    @NotBlank
    private String branch;
    @PositiveOrZero
    private Double cgpa;
    private Integer graduationYear;
    private String phone;
    @Size(max = 15)
    private List<String> skills;
    private Integer readiness;
    private String status;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public Integer getReadiness() { return readiness; }
    public void setReadiness(Integer readiness) { this.readiness = readiness; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
