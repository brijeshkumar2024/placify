package com.placement.auth_service.service;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class EmailService {

    private final Resend resend;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    public Mono<Void> sendOtpEmail(String toEmail, String otp) {
        return Mono.fromCallable(() -> {
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(toEmail)
                    .subject("Your verification OTP — Campus Placement Portal")
                    .html(buildOtpEmailHtml(otp))
                    .build();
            resend.emails().send(options);
            return null;
        }).then();
    }

    private String buildOtpEmailHtml(String otp) {
        return """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                    <h2 style="color: #1a1a1a;">Verify your email</h2>
                    <p style="color: #555;">Use the OTP below to complete your registration.
                       It expires in 10 minutes.</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                                color: #1a1a1a; background: #f4f4f4; padding: 20px;
                                text-align: center; border-radius: 8px; margin: 24px 0;">
                        %s
                    </div>
                    <p style="color: #999; font-size: 13px;">
                        If you didn't request this, ignore this email.
                    </p>
                </div>
                """.formatted(otp);
    }
}