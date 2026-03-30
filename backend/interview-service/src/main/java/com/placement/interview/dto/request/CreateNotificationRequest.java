package com.placement.interview.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateNotificationRequest {
    @NotBlank
    private String title;
    @NotBlank
    @Size(max = 2000)
    private String message;
    @NotBlank
    private String type;      // info | warning | urgent
    @NotBlank
    private String audience;  // all | branch:XYZ | year:2026 etc.
    private int durationDays = 7;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }
    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }
}
