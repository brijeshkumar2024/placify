package com.placement.user.service;
import com.placement.user.dto.request.UpdateProfileRequest;
import com.placement.user.model.StudentProfile;
import com.placement.user.repository.StudentProfileRepository;
import com.placement.user.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class StudentProfileService {
    private final StudentProfileRepository profileRepository;
    private final JwtUtil jwtUtil;
    public Mono<StudentProfile> getProfile(String token) {
        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return profileRepository.findByUserId(userId)
                .switchIfEmpty(createEmptyProfile(userId));
    }
    public Mono<StudentProfile> updateProfile(String token, UpdateProfileRequest request) {
        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return profileRepository.findByUserId(userId)
                .switchIfEmpty(createEmptyProfile(userId))
                .flatMap(profile -> {
                    if (request.getFullName() != null) profile.setFullName(request.getFullName());
                    if (request.getPhone() != null) profile.setPhone(request.getPhone());
                    if (request.getBranch() != null) profile.setBranch(request.getBranch());
                    if (request.getCgpa() > 0) profile.setCgpa(request.getCgpa());
                    if (request.getGraduationYear() > 0) profile.setGraduationYear(request.getGraduationYear());
                    if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
                    if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
                    if (request.getSkills() != null) profile.setSkills(request.getSkills());
                    if (request.getEducation() != null) {
                        profile.setEducation(request.getEducation().stream()
                                .map(e -> StudentProfile.Education.builder()
                                        .degree(e.getDegree()).institution(e.getInstitution())
                                        .year(e.getYear()).percentage(e.getPercentage()).build())
                                .collect(Collectors.toList()));
                    }
                    if (request.getExperience() != null) {
                        profile.setExperience(request.getExperience().stream()
                                .map(e -> StudentProfile.Experience.builder()
                                        .title(e.getTitle()).company(e.getCompany())
                                        .duration(e.getDuration()).description(e.getDescription()).build())
                                .collect(Collectors.toList()));
                    }
                    profile.setCompletionScore(calculateCompletion(profile));
                    profile.setStatus(profile.getCompletionScore() >= 70
                            ? StudentProfile.ProfileStatus.COMPLETE
                            : StudentProfile.ProfileStatus.INCOMPLETE);
                    return profileRepository.save(profile);
                });
    }
    private Mono<StudentProfile> createEmptyProfile(String userId) {
        return profileRepository.save(StudentProfile.builder()
                .userId(userId)
                .status(StudentProfile.ProfileStatus.INCOMPLETE)
                .completionScore(0)
                .build());
    }
    private int calculateCompletion(StudentProfile p) {
        int score = 0;
        if (p.getFullName() != null && !p.getFullName().isEmpty()) score += 15;
        if (p.getPhone() != null && !p.getPhone().isEmpty()) score += 10;
        if (p.getBranch() != null) score += 10;
        if (p.getCgpa() > 0) score += 15;
        if (p.getSkills() != null && !p.getSkills().isEmpty()) score += 20;
        if (p.getEducation() != null && !p.getEducation().isEmpty()) score += 15;
        if (p.getResumeUrl() != null) score += 15;
        return score;
    }
}
