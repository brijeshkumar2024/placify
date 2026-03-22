package com.placement.user.model;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "student_profiles")
public class StudentProfile {
    @Id private String id;
    @Indexed(unique = true) private String userId;
    private String email;
    private String fullName;
    private String phone;
    private String rollNumber;
    private String branch;
    private double cgpa;
    private int graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private String resumeUrl;
    private List<String> skills;
    private List<Education> education;
    private List<Experience> experience;
    private ProfileStatus status;
    private int completionScore;
    @CreatedDate private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;
    public enum ProfileStatus { INCOMPLETE, COMPLETE }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Education {
        private String degree;
        private String institution;
        private String year;
        private String percentage;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Experience {
        private String title;
        private String company;
        private String duration;
        private String description;
    }
}
