package com.placement.auth_service.model;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    private String email;
    private String password;
    private String fullName;
    private String rollNumber;
    private String collegeId;
    private Role role;
    private AccountStatus status;
    private int failedLoginAttempts;
    private Instant lockedUntil;
    @CreatedDate
    private Instant createdAt;
    public enum Role {
        STUDENT, RECRUITER, TPO, ADMIN
    }
    public enum AccountStatus {
        PENDING_VERIFICATION, PENDING_PROFILE, ACTIVE, FROZEN, SUSPENDED, GRADUATED, LOCKED
    }
}