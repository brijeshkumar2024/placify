package com.placement.interview.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SubmitAnswerRequest {

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotBlank(message = "Answer is required")
    private String answer;

    public SubmitAnswerRequest() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
}
