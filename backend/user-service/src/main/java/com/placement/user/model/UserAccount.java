package com.placement.user.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class UserAccount {
    @Id
    private String id;
    private String email;
    private String fullName;
    @JsonAlias({"rollNo", "roll_number"})
    private String rollNumber;

    public UserAccount() {
    }

    public UserAccount(String id, String email, String fullName, String rollNumber) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.rollNumber = rollNumber;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }
}
