package com.placement.job.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class ScheduleInterviewRequest {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Kolkata");
    private static final String INVALID_DATE_MESSAGE = "Invalid date format. Use ISO like 2026-03-31T20:40:00";

    @NotBlank
    private String applicationId;
    @NotBlank
    private String studentEmail;
    @NotNull
    private LocalDateTime dateTime;
    private String meetingLink;
    private String message;
    private String company;
    private String role;

    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    @JsonProperty("dateTime")
    public void setDateTime(String rawDateTime) {
        this.dateTime = parseDateTime(rawDateTime);
    }

    @JsonProperty("scheduledAt")
    public void setScheduledAt(String rawDateTime) {
        this.dateTime = parseDateTime(rawDateTime);
    }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    @JsonIgnore
    public Instant toInstant() {
        return dateTime.atZone(DEFAULT_ZONE).toInstant();
    }

    private LocalDateTime parseDateTime(String rawDateTime) {
        if (rawDateTime == null || rawDateTime.isBlank()) {
            return null;
        }

        try {
            return LocalDateTime.parse(rawDateTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException ignored) {
            try {
                return OffsetDateTime.parse(rawDateTime, DateTimeFormatter.ISO_DATE_TIME).toLocalDateTime();
            } catch (DateTimeParseException ex) {
                throw new IllegalArgumentException(INVALID_DATE_MESSAGE);
            }
        }
    }
}
