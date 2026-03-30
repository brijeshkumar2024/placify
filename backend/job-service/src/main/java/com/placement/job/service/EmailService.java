package com.placement.job.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a z").withZone(ZoneId.of("Asia/Kolkata"));

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public Mono<Void> sendInterviewScheduled(
            String to, String company, String role, Instant dateTime, String message) {

        if (!StringUtils.hasText(to)) {
            log.warn("[EmailService] Skipping email because studentEmail is missing.");
            return Mono.empty();
        }

        if (!StringUtils.hasText(fromAddress) || fromAddress.contains("your-email@")) {
            log.warn("[EmailService] SMTP is not fully configured. Set MAIL_USERNAME and MAIL_PASSWORD to enable interview emails. Skipping send to {}", to);
            return Mono.empty();
        }

        return Mono.fromRunnable(() -> {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromAddress);
            mail.setTo(to);
            mail.setSubject("Interview Scheduled – " + (company != null ? company : "Placement Team"));
            mail.setText(buildBody(company, role, dateTime, message));
            mailSender.send(mail);
            log.info("[EmailService] Interview email sent to {}", to);
        })
        .subscribeOn(Schedulers.boundedElastic())
        .doOnError(ex -> log.error("[EmailService] Failed to send email to {} — {}", to, ex.getMessage(), ex))
        .onErrorResume(ex -> Mono.empty())
        .then();
    }

    private String buildBody(String company, String role, Instant dateTime, String message) {
        StringBuilder sb = new StringBuilder();
        sb.append("Dear Candidate,\n\n");
        sb.append("Your interview has been scheduled. Here are the details:\n\n");
        sb.append("  Company : ").append(company != null ? company : "N/A").append("\n");
        sb.append("  Role    : ").append(role != null ? role : "N/A").append("\n");
        sb.append("  Date & Time : ").append(dateTime != null ? FMT.format(dateTime) : "TBD").append("\n");
        if (message != null && !message.isBlank()) {
            sb.append("\nMessage from recruiter:\n").append(message).append("\n");
        }
        sb.append("\nPlease be prepared and join on time.\n\n");
        sb.append("Best regards,\nPlacement Team");
        return sb.toString();
    }
}
