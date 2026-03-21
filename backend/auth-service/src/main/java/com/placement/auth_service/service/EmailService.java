package com.placement.auth_service.service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public Mono<Void> sendOtpEmail(String toEmail, String otp) {
        return Mono.fromRunnable(() -> {
            log.info("========================================");
            log.info("OTP FOR: {}", toEmail);
            log.info("OTP CODE: {}", otp);
            log.info("========================================");
        });
    }
}