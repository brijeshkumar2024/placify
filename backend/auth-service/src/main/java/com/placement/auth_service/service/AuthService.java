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
                            .role(u.getRole().name()).status(u.getStatus().name())
                            .accessToken(jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole().name()))
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
                                    .role(saved.getRole().name()).status(saved.getStatus().name())
                                    .accessToken(jwtUtil.generateToken(
                                            saved.getId(), saved.getEmail(), saved.getRole().name()))
                                    .refreshToken(jwtUtil.generateRefreshToken(saved.getId()))
                                    .build());
                });
    }
}
