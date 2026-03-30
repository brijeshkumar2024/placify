package com.placement.placement.dto.response;

import java.util.List;

public class CompanyDetailsResponse {
    private String companyName;
    private String location;
    private List<String> roles;
    private long openings;
    private long applicants;
    private String ctc;
    private List<ApplicantSummary> applicantList;

    public CompanyDetailsResponse() {}

    public static class ApplicantSummary {
        private String studentId;
        private String studentName;
        private String studentEmail;
        private String status;
        private String role;

        public ApplicantSummary() {}
        public ApplicantSummary(String studentId, String studentName, String studentEmail, String status, String role) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.status = status;
            this.role = role;
        }

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public long getOpenings() { return openings; }
    public void setOpenings(long openings) { this.openings = openings; }
    public long getApplicants() { return applicants; }
    public void setApplicants(long applicants) { this.applicants = applicants; }
    public String getCtc() { return ctc; }
    public void setCtc(String ctc) { this.ctc = ctc; }
    public List<ApplicantSummary> getApplicantList() { return applicantList; }
    public void setApplicantList(List<ApplicantSummary> applicantList) { this.applicantList = applicantList; }
}
