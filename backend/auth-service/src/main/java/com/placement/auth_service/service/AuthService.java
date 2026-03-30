package com.placement.auth_service.service;
import com.placement.auth_service.dto.request.LoginRequest;
import com.placement.auth_service.dto.request.RegisterRequest;
import com.placement.auth_service.dto.response.AuthResponse;
import com.placement.auth_service.exception.AppException;
import com.placement.auth_service.model.User;
import com.placement.auth_service.repository.CollegeRepository;
import com.placement.auth_service.repository.UserRepository;
import com.placement.auth_service.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    @org.springframework.beans.factory.annotation.Value("${reset.frontend-base-url}")
    private String resetFrontendBaseUrl;

    private static final String RESET_TOKEN_TYPE = "password_reset";

    public Mono<String> checkEmailAndSendOtp(String email) {
        String domain = email.substring(email.indexOf('@') + 1);
        return collegeRepository.findByAllowedDomainsContaining(domain)
                .switchIfEmpty(Mono.error(new AppException(
                        "This email domain is not registered. Contact your TPO.", HttpStatus.BAD_REQUEST)))
                .flatMap(college -> userRepository.existsByEmail(email)
                        .flatMap(exists -> {
                            if (exists) return Mono.error(new AppException(
                                    "An account with this email already exists.", HttpStatus.CONFLICT));
                            return otpService.generateAndStoreOtp(email)
                                    .flatMap(otp -> emailService.sendOtpEmail(email, otp))
                                    .thenReturn("OTP sent to " + email);
                        }));
    }

    public Mono<String> verifyOtp(String email, String otp) {
        return otpService.verifyOtp(email, otp)
                .flatMap(valid -> {
                    if (!valid) return Mono.error(new AppException(
                            "Invalid or expired OTP.", HttpStatus.BAD_REQUEST));
                    return Mono.just("Email verified successfully.");
                });
    }

    public Mono<AuthResponse> register(RegisterRequest request) {
        String domain = request.getEmail().substring(request.getEmail().indexOf('@') + 1);
        return collegeRepository.findByAllowedDomainsContaining(domain)
                .switchIfEmpty(Mono.error(new AppException("Invalid email domain.", HttpStatus.BAD_REQUEST)))
                .flatMap(college -> userRepository
                        .existsByRollNumberAndCollegeId(request.getRollNumber(), college.getId())
                        .flatMap(rollExists -> {
                            if (rollExists) return Mono.error(new AppException(
                                    "This roll number is already registered.", HttpStatus.CONFLICT));
                            User user = User.builder()
                                    .email(request.getEmail())
                                    .password(passwordEncoder.encode(request.getPassword()))
                                    .fullName(request.getFullName())
                                    .rollNumber(request.getRollNumber())
                                    .collegeId(college.getId())
                                    .role(User.Role.STUDENT)
                                    .status(User.AccountStatus.PENDING_PROFILE)
                                    .failedLoginAttempts(0)
                                    .build();
                            return userRepository.save(user);
                        }))
                .map(saved -> {
                    User u = (User) saved;
                    return AuthResponse.builder()
                            .userId(u.getId()).email(u.getEmail())
                            .fullName(u.getFullName())
                            .role(u.getRole().name()).status(u.getStatus().name())
                            .accessToken(jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole().name(), u.getFullName()))
                            .refreshToken(jwtUtil.generateRefreshToken(u.getId()))
                            .build();
                });
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .switchIfEmpty(Mono.error(new AppException(
                        "Invalid email or password.", HttpStatus.UNAUTHORIZED)))
                .flatMap(user -> {
                    if (user.getStatus() == User.AccountStatus.SUSPENDED)
                        return Mono.error(new AppException("Account suspended.", HttpStatus.FORBIDDEN));
                    if (user.getLockedUntil() != null &&
                            user.getLockedUntil().isAfter(java.time.Instant.now()))
                        return Mono.error(new AppException("Account locked. Try again later.", HttpStatus.FORBIDDEN));
                    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                        if (user.getFailedLoginAttempts() >= 5) {
                            user.setLockedUntil(java.time.Instant.now().plusSeconds(900));
                            user.setStatus(User.AccountStatus.LOCKED);
                        }
                        return userRepository.save(user)
                                .then(Mono.error(new AppException(
                                        "Invalid email or password.", HttpStatus.UNAUTHORIZED)));
                    }
                    user.setFailedLoginAttempts(0);
                    user.setLockedUntil(null);
                    if (user.getStatus() == User.AccountStatus.LOCKED)
                        user.setStatus(User.AccountStatus.ACTIVE);
                    return userRepository.save(user)
                            .map(saved -> AuthResponse.builder()
                                    .userId(saved.getId()).email(saved.getEmail())
                                    .fullName(saved.getFullName())
                                    .role(saved.getRole().name()).status(saved.getStatus().name())
                                    .accessToken(jwtUtil.generateToken(
                                            saved.getId(), saved.getEmail(), saved.getRole().name(), saved.getFullName()))
                                    .refreshToken(jwtUtil.generateRefreshToken(saved.getId()))
                                    .build());
                });
    }

    public Mono<String> forgotPassword(String email) {
        // Avoid user enumeration: always return a generic success message.
        final String genericMsg = "If the email exists, a password reset link has been sent.";
        return userRepository.findByEmail(email)
                .flatMap(user -> {
                    String resetToken = jwtUtil.generatePasswordResetToken(user.getId(), user.getEmail());
                    String resetLink = resetFrontendBaseUrl + "?token=" + resetToken;
                    return emailService.sendResetPasswordEmail(user.getEmail(), resetLink)
                            .thenReturn(genericMsg);
                })
                .switchIfEmpty(Mono.just(genericMsg));
    }

    public Mono<String> resetPassword(String resetToken, String newPassword) {
        if (!jwtUtil.isTokenValid(resetToken)) {
            return Mono.error(new AppException("Invalid or expired reset token.", HttpStatus.BAD_REQUEST));
        }
        String tokenType = jwtUtil.extractTokenType(resetToken);
        if (!RESET_TOKEN_TYPE.equals(tokenType)) {
            return Mono.error(new AppException("Invalid reset token.", HttpStatus.BAD_REQUEST));
        }

        String userId = jwtUtil.extractUserId(resetToken);
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new AppException("User not found.", HttpStatus.NOT_FOUND)))
                .flatMap(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setFailedLoginAttempts(0);
                    user.setLockedUntil(null);
                    if (user.getStatus() == User.AccountStatus.LOCKED) {
                        user.setStatus(User.AccountStatus.ACTIVE);
                    }
                    return userRepository.save(user).thenReturn("Password updated successfully.");
                });
    }

    // ── ADMIN / TPO: CREATE RECRUITER ───────────────────────────────────────
    public Mono<AuthResponse> createRecruiter(String bearerToken, com.placement.auth_service.dto.request.CreateRecruiterRequest request) {
        if (bearerToken == null || bearerToken.isBlank()) {
            return Mono.error(new AppException("Authorization required.", HttpStatus.FORBIDDEN));
        }
        String clean = bearerToken.replace("Bearer ", "");
        String role = jwtUtil.extractRole(clean);
        if (role == null || (!role.equals("TPO") && !role.equals("ADMIN"))) {
            return Mono.error(new AppException("Only TPO/Admin can create recruiters.", HttpStatus.FORBIDDEN));
        }

        return userRepository.existsByEmail(request.getEmail())
                .flatMap(exists -> {
                    if (exists) return Mono.error(new AppException("Email already exists.", HttpStatus.CONFLICT));
                    User user = User.builder()
                            .email(request.getEmail())
                            .password(passwordEncoder.encode(request.getPassword()))
                            .fullName(request.getFullName())
                            .role(User.Role.RECRUITER)
                            .status(User.AccountStatus.ACTIVE)
                            .failedLoginAttempts(0)
                            .build();
                    return userRepository.save(user);
                })
                .map(saved -> AuthResponse.builder()
                        .userId(saved.getId()).email(saved.getEmail())
                        .fullName(saved.getFullName())
                        .role(saved.getRole().name()).status(saved.getStatus().name())
                        .accessToken(jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name(), saved.getFullName()))
                        .refreshToken(jwtUtil.generateRefreshToken(saved.getId()))
                        .build());
    }
}
