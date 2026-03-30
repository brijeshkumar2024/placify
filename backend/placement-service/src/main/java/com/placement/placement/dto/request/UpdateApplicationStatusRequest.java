package com.placement.placement.dto.request;

public class UpdateApplicationStatusRequest {
    private String status;
    private Integer currentRound;
    private String roundResult;

    public UpdateApplicationStatusRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getCurrentRound() { return currentRound; }
    public void setCurrentRound(Integer currentRound) { this.currentRound = currentRound; }
    public String getRoundResult() { return roundResult; }
    public void setRoundResult(String roundResult) { this.roundResult = roundResult; }
}
