package com.placement.auth_service.controller;
import com.placement.auth_service.dto.request.CheckEmailRequest;
import com.placement.auth_service.dto.request.ForgotPasswordRequest;
import com.placement.auth_service.dto.request.LoginRequest;
import com.placement.auth_service.dto.request.RegisterRequest;
import com.placement.auth_service.dto.request.ResetPasswordRequest;
import com.placement.auth_service.dto.request.VerifyOtpRequest;
import com.placement.auth_service.dto.response.ApiResponse;
import com.placement.auth_service.dto.response.AuthResponse;
import com.placement.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/check-email")
    public Mono<ResponseEntity<ApiResponse<String>>> checkEmail(@Valid @RequestBody CheckEmailRequest request) {
        return authService.checkEmailAndSendOtp(request.getEmail())
                .map(msg -> ResponseEntity.ok(ApiResponse.<String>success(msg, null)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }
    @PostMapping("/verify-otp")
    public Mono<ResponseEntity<ApiResponse<String>>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request.getEmail(), request.getOtp())
                .map(msg -> ResponseEntity.ok(ApiResponse.<String>success(msg, null)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }
    @PostMapping("/register")
    public Mono<ResponseEntity<ApiResponse<AuthResponse>>> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request)
                .map(auth -> ResponseEntity.ok(ApiResponse.success("Account created successfully.", auth)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }
    @PostMapping("/admin/recruiters")
    public Mono<ResponseEntity<ApiResponse<AuthResponse>>> createRecruiter(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody com.placement.auth_service.dto.request.CreateRecruiterRequest request) {
        return authService.createRecruiter(token, request)
                .map(auth -> ResponseEntity.ok(ApiResponse.success("Recruiter created.", auth)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }
    @PostMapping("/login")
    public Mono<ResponseEntity<ApiResponse<AuthResponse>>> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request)
                .map(auth -> ResponseEntity.ok(ApiResponse.success("Login successful.", auth)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @PostMapping("/forgot-password")
    public Mono<ResponseEntity<ApiResponse<String>>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request.getEmail())
                .map(msg -> ResponseEntity.ok(ApiResponse.<String>success(msg, null)));
    }

    @PostMapping("/reset-password")
    public Mono<ResponseEntity<ApiResponse<String>>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request.getToken(), request.getNewPassword())
                .map(msg -> ResponseEntity.ok(ApiResponse.<String>success(msg, null)));
    }
    @GetMapping("/health")
    public Mono<ResponseEntity<ApiResponse<String>>> health() {
        return Mono.just(ResponseEntity.ok(ApiResponse.<String>success("Auth service is running.", null)));
    }
}
