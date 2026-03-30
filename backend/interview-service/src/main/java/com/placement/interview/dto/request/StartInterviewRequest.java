package com.placement.interview.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StartInterviewRequest {

    @NotBlank(message = "Domain is required")
    @Pattern(regexp = "DSA|SYSTEM_DESIGN|HR|CORE_CS",
             message = "Domain must be DSA, SYSTEM_DESIGN, HR, or CORE_CS")
    private String domain;

    @NotBlank(message = "Difficulty is required")
    @Pattern(regexp = "EASY|MEDIUM|HARD",
             message = "Difficulty must be EASY, MEDIUM, or HARD")
    private String difficulty;

    private int totalQuestions = 5;

    public StartInterviewRequest() {}

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
}
