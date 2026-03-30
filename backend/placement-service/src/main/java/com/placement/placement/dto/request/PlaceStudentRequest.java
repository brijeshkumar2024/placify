package com.placement.placement.dto.request;

public class PlaceStudentRequest {
    private String placedCompany;
    private Double placedCtc;

    public PlaceStudentRequest() {}

    public String getPlacedCompany() { return placedCompany; }
    public void setPlacedCompany(String placedCompany) { this.placedCompany = placedCompany; }
    public Double getPlacedCtc() { return placedCtc; }
    public void setPlacedCtc(Double placedCtc) { this.placedCtc = placedCtc; }
}
