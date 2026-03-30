package com.placement.placement.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class StudentImportRequest {
    @NotEmpty
    private List<StudentCreateRequest> students;

    public List<StudentCreateRequest> getStudents() { return students; }
    public void setStudents(List<StudentCreateRequest> students) { this.students = students; }
}
