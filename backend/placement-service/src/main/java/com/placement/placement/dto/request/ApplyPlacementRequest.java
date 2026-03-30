package com.placement.placement.dto.request;

import java.util.List;
import java.util.Map;

public class ApplyPlacementRequest {
    private String studentEmail;
    private String studentName;
    private Double studentCgpa;
    private String studentBranch;
    private List<String> studentSkills;
    private String resumeUrl;
    private Map<String, String> customAnswers;

    public ApplyPlacementRequest() {}

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Double getStudentCgpa() { return studentCgpa; }
    public void setStudentCgpa(Double studentCgpa) { this.studentCgpa = studentCgpa; }
    public String getStudentBranch() { return studentBranch; }
    public void setStudentBranch(String studentBranch) { this.studentBranch = studentBranch; }
    public List<String> getStudentSkills() { return studentSkills; }
    public void setStudentSkills(List<String> studentSkills) { this.studentSkills = studentSkills; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public Map<String, String> getCustomAnswers() { return customAnswers; }
    public void setCustomAnswers(Map<String, String> customAnswers) { this.customAnswers = customAnswers; }
}
