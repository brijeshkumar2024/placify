package com.placement.auth_service;

import com.placement.auth_service.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EmailSmokeTest {

    @Autowired
    private EmailService emailService;

    @Test
    void sendTrialEmail() {
        emailService.sendOtpEmail("2301020104@cgu-odisha.ac.in", "382910")
                .doOnSuccess(v -> System.out.println("✅ Trial email sent to 2301020104@cgu-odisha.ac.in!"))
                .doOnError(e -> System.err.println("❌ Failed: " + e.getMessage()))
                .block();
    }
}
