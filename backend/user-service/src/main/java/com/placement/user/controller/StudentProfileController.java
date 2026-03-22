package com.placement.user.controller;
import com.placement.user.dto.request.UpdateProfileRequest;
import com.placement.user.dto.response.ApiResponse;
import com.placement.user.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class StudentProfileController {
    private final StudentProfileService profileService;
    @GetMapping("/health")
    public Mono<ResponseEntity<ApiResponse<String>>> health() {
        return Mono.just(ResponseEntity.ok(ApiResponse.success("User service is running.", null)));
    }
    @GetMapping("/profile")
    public Mono<ResponseEntity<ApiResponse<Object>>> getProfile(
            @RequestHeader("Authorization") String token) {
        return profileService.getProfile(token)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Profile fetched.", (Object) p)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }
    @PutMapping("/profile")
    public Mono<ResponseEntity<ApiResponse<Object>>> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(token, request)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Profile updated.", (Object) p)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }
}
