package com.placement.user.controller;

import com.placement.user.dto.request.UpdateProfileRequest;
import com.placement.user.dto.response.ApiResponse;
import com.placement.user.dto.response.StudentProfileResponse;
import com.placement.user.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/users")
public class StudentProfileController {
    private final StudentProfileService profileService;

    public StudentProfileController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/health")
    public Mono<ResponseEntity<ApiResponse<String>>> health() {
        return Mono.just(ResponseEntity.ok(ApiResponse.success("User service is running.", null)));
    }

    @GetMapping("/profile")
    public Mono<ResponseEntity<ApiResponse<StudentProfileResponse>>> getProfile(
            @RequestHeader("Authorization") String token) {
        return profileService.getProfile(token)
                .map(profile -> ResponseEntity.ok(ApiResponse.success("Profile fetched.", profile)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }

    @PutMapping("/profile")
    public Mono<ResponseEntity<ApiResponse<StudentProfileResponse>>> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(token, request)
                .map(profile -> ResponseEntity.ok(ApiResponse.success("Profile updated.", profile)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }
}

