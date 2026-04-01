package com.placement.auth_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Core reusable method — supports both plain text and HTML.
     */
    public Mono<Boolean> sendEmail(String to, String subject, String body, boolean isHtml) {
        return Mono.fromCallable(() -> {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, isHtml);
            mailSender.send(message);
            log.info("Email sent to [{}] | subject: '{}'", to, subject);
            return true;
        })
        .subscribeOn(Schedulers.boundedElastic())
        .onErrorResume(e -> {
            log.error("Failed to send email to [{}]: {}", to, e.getMessage());
            return Mono.just(false);
        });
    }

    public Mono<Void> sendOtpEmail(String toEmail, String otp) {
        String subject = "Your Placify Verification Code";
        String html = buildOtpHtml(otp);
        return sendEmail(toEmail, subject, html, true).then();
    }

    public Mono<Void> sendResetPasswordEmail(String toEmail, String resetLink) {
        String subject = "Reset Your Placify Password";
        String html = buildResetHtml(resetLink);
        return sendEmail(toEmail, subject, html, true).then();
    }

    // ─── HTML Templates ───────────────────────────────────────────────────────

    private String buildOtpHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 0;">
                  <table width="480" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#667eea,#764ba2);
                                 padding:32px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:24px;">Placify</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">
                          Email Verification
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px 32px;text-align:center;">
                        <p style="color:#374151;font-size:16px;margin:0 0 24px;">
                          Use the code below to verify your account.
                          It expires in <strong>10 minutes</strong>.
                        </p>
                        <div style="background:#f3f4f6;border-radius:8px;
                                    padding:20px 40px;display:inline-block;">
                          <span style="font-size:36px;font-weight:700;
                                       letter-spacing:10px;color:#4f46e5;">
                            %s
                          </span>
                        </div>
                        <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">
                          If you didn't request this, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f9fafb;padding:16px 32px;
                                 text-align:center;border-top:1px solid #e5e7eb;">
                        <p style="color:#9ca3af;font-size:12px;margin:0;">
                          &copy; 2025 Placify. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(otp);
    }

    private String buildResetHtml(String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 0;">
                  <table width="480" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#667eea,#764ba2);
                                 padding:32px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:24px;">Placify</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">
                          Password Reset
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px 32px;text-align:center;">
                        <p style="color:#374151;font-size:16px;margin:0 0 28px;">
                          Click the button below to reset your password.
                          This link expires in <strong>15 minutes</strong>.
                        </p>
                        <a href="%s"
                           style="background:linear-gradient(135deg,#667eea,#764ba2);
                                  color:#fff;text-decoration:none;padding:14px 36px;
                                  border-radius:8px;font-size:15px;font-weight:600;
                                  display:inline-block;">
                          Reset Password
                        </a>
                        <p style="color:#9ca3af;font-size:13px;margin:28px 0 0;">
                          If you didn't request a password reset, ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f9fafb;padding:16px 32px;
                                 text-align:center;border-top:1px solid #e5e7eb;">
                        <p style="color:#9ca3af;font-size:12px;margin:0;">
                          &copy; 2025 Placify. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(resetLink);
    }
}
