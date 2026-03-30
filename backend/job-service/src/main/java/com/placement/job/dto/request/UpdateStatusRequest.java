package com.placement.job.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateStatusRequest {
    @NotBlank
    private String applicationId;
    @NotBlank
    private String status;
    private String notes;
    private Integer rating;

    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
