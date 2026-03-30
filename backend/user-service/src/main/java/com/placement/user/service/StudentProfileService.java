package com.placement.user.service;

import com.placement.user.dto.request.UpdateProfileRequest;
import com.placement.user.dto.response.StudentProfileResponse;
import com.placement.user.model.StudentProfile;
import com.placement.user.model.UserAccount;
import com.placement.user.repository.StudentProfileRepository;
import com.placement.user.repository.UserAccountRepository;
import com.placement.user.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.stream.Collectors;

@Service
public class StudentProfileService {
    private static final Logger logger = LoggerFactory.getLogger(StudentProfileService.class);

    private final StudentProfileRepository profileRepository;
    private final UserAccountRepository userAccountRepository;
    private final JwtUtil jwtUtil;

    public StudentProfileService(StudentProfileRepository profileRepository,
                                 UserAccountRepository userAccountRepository,
                                 JwtUtil jwtUtil) {
        this.profileRepository = profileRepository;
        this.userAccountRepository = userAccountRepository;
        this.jwtUtil = jwtUtil;
    }

    public Mono<StudentProfileResponse> getProfile(String token) {
        String userId = extractUserId(token);
        return loadOrCreateProfile(userId)
                .flatMap(this::enrichProfileFromUserAccount)
                .doOnNext(profile -> logger.info("Profile fetch response for userId={} rollNumber={}", userId, profile.getRollNumber()))
                .map(StudentProfileResponse::fromProfile);
    }

    public Mono<StudentProfileResponse> updateProfile(String token, UpdateProfileRequest request) {
        String userId = extractUserId(token);
        return loadOrCreateProfile(userId)
                .flatMap(this::enrichProfileFromUserAccount)
                .flatMap(profile -> {
                    if (hasText(request.getFullName())) profile.setFullName(request.getFullName());
                    if (hasText(request.getPhone())) profile.setPhone(request.getPhone());
                    if (hasText(request.getRollNumber())) profile.setRollNumber(request.getRollNumber());
                    if (hasText(request.getBranch())) profile.setBranch(request.getBranch());
                    if (request.getCgpa() > 0) profile.setCgpa(request.getCgpa());
                    if (request.getGraduationYear() > 0) profile.setGraduationYear(request.getGraduationYear());
                    if (hasText(request.getLinkedinUrl())) profile.setLinkedinUrl(request.getLinkedinUrl());
                    if (hasText(request.getGithubUrl())) profile.setGithubUrl(request.getGithubUrl());
                    if (request.getSkills() != null) profile.setSkills(request.getSkills());
                    if (request.getEducation() != null) {
                        profile.setEducation(request.getEducation().stream()
                                .map(e -> new StudentProfile.Education(
                                        e.getDegree(),
                                        e.getInstitution(),
                                        e.getYear(),
                                        e.getPercentage()))
                                .collect(Collectors.toList()));
                    }
                    if (request.getExperience() != null) {
                        profile.setExperience(request.getExperience().stream()
                                .map(e -> new StudentProfile.Experience(
                                        e.getTitle(),
                                        e.getCompany(),
                                        e.getDuration(),
                                        e.getDescription()))
                                .collect(Collectors.toList()));
                    }
                    profile.setCompletionScore(calculateCompletion(profile));
                    profile.setStatus(profile.getCompletionScore() >= 70
                            ? StudentProfile.ProfileStatus.COMPLETE
                            : StudentProfile.ProfileStatus.INCOMPLETE);
                    return profileRepository.save(profile);
                })
                .doOnNext(profile -> logger.info("Profile update response for userId={} rollNumber={}", userId, profile.getRollNumber()))
                .map(StudentProfileResponse::fromProfile);
    }

    private String extractUserId(String token) {
        return jwtUtil.extractUserId(token.replace("Bearer ", ""));
    }

    private Mono<StudentProfile> loadOrCreateProfile(String userId) {
        return profileRepository.findByUserId(userId)
                .switchIfEmpty(createEmptyProfile(userId));
    }

    private Mono<StudentProfile> enrichProfileFromUserAccount(StudentProfile profile) {
        return userAccountRepository.findById(profile.getUserId())
                .flatMap(userAccount -> {
                    boolean changed = false;

                    if (!hasText(profile.getEmail()) && hasText(userAccount.getEmail())) {
                        profile.setEmail(userAccount.getEmail());
                        changed = true;
                    }
                    if (!hasText(profile.getFullName()) && hasText(userAccount.getFullName())) {
                        profile.setFullName(userAccount.getFullName());
                        changed = true;
                    }
                    if (!hasText(profile.getRollNumber()) && hasText(userAccount.getRollNumber())) {
                        profile.setRollNumber(userAccount.getRollNumber());
                        changed = true;
                    }

                    if (changed) {
                        logger.info("Hydrating student profile for userId={} using users collection data.", profile.getUserId());
                        return profileRepository.save(profile);
                    }
                    return Mono.just(profile);
                })
                .switchIfEmpty(Mono.just(profile));
    }

    private Mono<StudentProfile> createEmptyProfile(String userId) {
        StudentProfile profile = new StudentProfile();
        profile.setUserId(userId);
        profile.setStatus(StudentProfile.ProfileStatus.INCOMPLETE);
        profile.setCompletionScore(0);

        return userAccountRepository.findById(userId)
                .map(userAccount -> applyUserDefaults(profile, userAccount))
                .defaultIfEmpty(profile)
                .flatMap(profileRepository::save);
    }

    private StudentProfile applyUserDefaults(StudentProfile profile, UserAccount userAccount) {
        if (hasText(userAccount.getEmail())) {
            profile.setEmail(userAccount.getEmail());
        }
        if (hasText(userAccount.getFullName())) {
            profile.setFullName(userAccount.getFullName());
        }
        if (hasText(userAccount.getRollNumber())) {
            profile.setRollNumber(userAccount.getRollNumber());
        }
        return profile;
    }

    private int calculateCompletion(StudentProfile profile) {
        int score = 0;
        if (hasText(profile.getFullName())) score += 15;
        if (hasText(profile.getPhone())) score += 10;
        if (hasText(profile.getBranch())) score += 10;
        if (profile.getCgpa() > 0) score += 15;
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) score += 20;
        if (profile.getEducation() != null && !profile.getEducation().isEmpty()) score += 15;
        if (hasText(profile.getResumeUrl())) score += 15;
        return score;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}

