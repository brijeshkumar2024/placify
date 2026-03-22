package com.placement.user.dto.request;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String branch;
    private double cgpa;
    private int graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private List<String> skills;
    private List<EducationDto> education;
    private List<ExperienceDto> experience;
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class EducationDto {
        private String degree;
        private String institution;
        private String year;
        private String percentage;
    }
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ExperienceDto {
        private String title;
        private String company;
        private String duration;
        private String description;
    }
}
