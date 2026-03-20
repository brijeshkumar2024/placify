package com.placement.auth_service.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "colleges")
public class College {
    @Id private String id;
    private String name;
    @Indexed(unique = true) private List<String> allowedDomains;
    private String tpoEmail;
    private boolean active;
    @CreatedDate private Instant createdAt;
}