package com.placement.placement.dto.request;

public class HoldStudentRequest {
    private boolean onHold;
    private String holdReason;

    public HoldStudentRequest() {}

    public boolean isOnHold() { return onHold; }
    public void setOnHold(boolean onHold) { this.onHold = onHold; }
    public String getHoldReason() { return holdReason; }
    public void setHoldReason(String holdReason) { this.holdReason = holdReason; }
}
