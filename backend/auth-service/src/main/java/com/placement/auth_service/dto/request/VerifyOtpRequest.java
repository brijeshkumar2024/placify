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
public class VerifyOtpRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
    private String otp;
}