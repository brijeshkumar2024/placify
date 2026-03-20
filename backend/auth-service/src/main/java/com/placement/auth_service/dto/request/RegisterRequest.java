package com.placement.auth_service.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Email private String email;
    @NotBlank(message = "Full name is required") private String fullName;
    @NotBlank(message = "Roll number is required") private String rollNumber;
    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") private String password;
}