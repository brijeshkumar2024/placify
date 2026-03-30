package com.placement.job.dto.request;

import jakarta.validation.constraints.NotNull;

public class NotesRequest {
    @NotNull
    private String notes;

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
