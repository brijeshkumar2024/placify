package com.placement.interview.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "student_performance")
public class StudentPerformance {

    @Id
    private String id;
    private String studentId;
    private String topic;
    private String subtopic;
    private int score;
    private String feedback;
    private boolean isWeakArea;
    private LocalDateTime timestamp;

    public StudentPerformance() {}

    public StudentPerformance(String studentId, String topic, String subtopic, int score, String feedback, boolean isWeakArea) {
        this.studentId = studentId;
        this.topic = topic;
        this.subtopic = subtopic;
        this.score = score;
        this.feedback = feedback;
        this.isWeakArea = isWeakArea;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getSubtopic() { return subtopic; }
    public void setSubtopic(String subtopic) { this.subtopic = subtopic; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public boolean isWeakArea() { return isWeakArea; }
    public void setWeakArea(boolean weakArea) { isWeakArea = weakArea; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
