package com.placement.auth_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateRecruiterRequest {
    @Email @NotBlank
    private String email;
    @NotBlank
    private String fullName;
    @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    private String company;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
}
