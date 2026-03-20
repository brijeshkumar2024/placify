package com.placement.auth_service.service;
import com.placement.auth_service.util.OtpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.time.Duration;
@Service
@RequiredArgsConstructor
public class OtpService {
    private final ReactiveStringRedisTemplate redisTemplate;
    private final OtpUtil otpUtil;
    @Value("${otp.expiry-minutes}") private int expiryMinutes;
    @Value("${otp.max-attempts}") private int maxAttempts;
    @Value("${otp.max-resends}") private int maxResends;
    @Value("${otp.lockout-minutes}") private int lockoutMinutes;
    private String otpKey(String e)      { return "otp:" + e; }
    private String attemptsKey(String e) { return "otp:attempts:" + e; }
    private String resendKey(String e)   { return "otp:resends:" + e; }
    private String lockKey(String e)     { return "otp:lock:" + e; }
    public Mono<String> generateAndStoreOtp(String email) {
        return redisTemplate.opsForValue().get(lockKey(email))
                .flatMap(lock -> Mono.<String>error(new RuntimeException("Too many attempts. Try again in " + lockoutMinutes + " minutes.")))
                .switchIfEmpty(checkResendLimit(email).then(Mono.defer(() -> {
                    String otp = otpUtil.generateOtp();
                    return redisTemplate.opsForValue().set(otpKey(email), otp, Duration.ofMinutes(expiryMinutes))
                            .then(incrementResendCount(email)).thenReturn(otp);
                })));
    }
    public Mono<Boolean> verifyOtp(String email, String otp) {
        return redisTemplate.opsForValue().get(lockKey(email))
                .flatMap(lock -> Mono.<Boolean>error(new RuntimeException("Account locked.")))
                .switchIfEmpty(redisTemplate.opsForValue().get(otpKey(email))
                        .flatMap(stored -> {
                            if (stored.equals(otp)) {
                                return redisTemplate.delete(otpKey(email))
                                        .then(redisTemplate.delete(attemptsKey(email)))
                                        .then(redisTemplate.delete(resendKey(email)))
                                        .thenReturn(true);
                            }
                            return incrementAttempts(email).thenReturn(false);
                        }).switchIfEmpty(Mono.just(false)));
    }
    private Mono<Void> checkResendLimit(String email) {
        return redisTemplate.opsForValue().get(resendKey(email))
                .flatMap(count -> {
                    if (Integer.parseInt(count) >= maxResends) {
                        return redisTemplate.opsForValue().set(lockKey(email), "1", Duration.ofMinutes(lockoutMinutes))
                                .then(Mono.<Void>error(new RuntimeException("Max resends reached.")));
                    }
                    return Mono.<Void>empty();
                }).switchIfEmpty(Mono.empty());
    }
    private Mono<Void> incrementResendCount(String email) {
        return redisTemplate.opsForValue().increment(resendKey(email))
                .then(redisTemplate.expire(resendKey(email), Duration.ofMinutes(lockoutMinutes))).then();
    }
    private Mono<Void> incrementAttempts(String email) {
        return redisTemplate.opsForValue().increment(attemptsKey(email))
                .flatMap(attempts -> {
                    if (attempts >= maxAttempts) {
                        return redisTemplate.opsForValue().set(lockKey(email), "1", Duration.ofMinutes(lockoutMinutes))
                                .then(redisTemplate.delete(otpKey(email))).then();
                    }
                    return redisTemplate.expire(attemptsKey(email), Duration.ofMinutes(expiryMinutes)).then();
                });
    }
}