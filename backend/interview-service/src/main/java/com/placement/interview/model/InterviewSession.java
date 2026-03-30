package com.placement.interview.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "interview_sessions")
public class InterviewSession {

    @Id private String id;
    @Indexed private String userId;
    private String domain;
    private String difficulty;
    private List<QuestionAnswer> questionAnswers;
    private SessionStatus status;
    private FinalReport finalReport;
    private int totalQuestions;
    private int currentQuestionIndex;
    @CreatedDate private Instant createdAt;
    private Instant completedAt;

    public InterviewSession() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String v) { this.userId = v; }
    public String getDomain() { return domain; }
    public void setDomain(String v) { this.domain = v; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String v) { this.difficulty = v; }
    public List<QuestionAnswer> getQuestionAnswers() { return questionAnswers; }
    public void setQuestionAnswers(List<QuestionAnswer> v) { this.questionAnswers = v; }
    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus v) { this.status = v; }
    public FinalReport getFinalReport() { return finalReport; }
    public void setFinalReport(FinalReport v) { this.finalReport = v; }
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int v) { this.totalQuestions = v; }
    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(int v) { this.currentQuestionIndex = v; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant v) { this.createdAt = v; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant v) { this.completedAt = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final InterviewSession s = new InterviewSession();
        public Builder userId(String v)                        { s.userId = v; return this; }
        public Builder domain(String v)                        { s.domain = v; return this; }
        public Builder difficulty(String v)                    { s.difficulty = v; return this; }
        public Builder questionAnswers(List<QuestionAnswer> v) { s.questionAnswers = v; return this; }
        public Builder status(SessionStatus v)                 { s.status = v; return this; }
        public Builder finalReport(FinalReport v)              { s.finalReport = v; return this; }
        public Builder totalQuestions(int v)                   { s.totalQuestions = v; return this; }
        public Builder currentQuestionIndex(int v)             { s.currentQuestionIndex = v; return this; }
        public InterviewSession build()                        { return s; }
    }

    public enum SessionStatus { IN_PROGRESS, COMPLETED, ABANDONED }

    // ── QuestionAnswer ───────────────────────────────────────────────────────

    public static class QuestionAnswer {
        private int index;
        private String question;
        private String answer;
        private int score;
        private int technicalAccuracy;
        private int communication;
        private int confidence;
        private int completeness;
        private String feedback;
        private String correctAnswer;
        private String improvements;
        private boolean answered;

        public QuestionAnswer() {}

        public int getIndex() { return index; }
        public void setIndex(int v) { this.index = v; }
        public String getQuestion() { return question; }
        public void setQuestion(String v) { this.question = v; }
        public String getAnswer() { return answer; }
        public void setAnswer(String v) { this.answer = v; }
        public int getScore() { return score; }
        public void setScore(int v) { this.score = v; }
        public int getTechnicalAccuracy() { return technicalAccuracy; }
        public void setTechnicalAccuracy(int v) { this.technicalAccuracy = v; }
        public int getCommunication() { return communication; }
        public void setCommunication(int v) { this.communication = v; }
        public int getConfidence() { return confidence; }
        public void setConfidence(int v) { this.confidence = v; }
        public int getCompleteness() { return completeness; }
        public void setCompleteness(int v) { this.completeness = v; }
        public String getFeedback() { return feedback; }
        public void setFeedback(String v) { this.feedback = v; }
        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String v) { this.correctAnswer = v; }
        public String getImprovements() { return improvements; }
        public void setImprovements(String v) { this.improvements = v; }
        public boolean isAnswered() { return answered; }
        public void setAnswered(boolean v) { this.answered = v; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final QuestionAnswer qa = new QuestionAnswer();
            public Builder index(int v)             { qa.index = v; return this; }
            public Builder question(String v)       { qa.question = v; return this; }
            public Builder answer(String v)         { qa.answer = v; return this; }
            public Builder score(int v)             { qa.score = v; return this; }
            public Builder technicalAccuracy(int v) { qa.technicalAccuracy = v; return this; }
            public Builder communication(int v)     { qa.communication = v; return this; }
            public Builder confidence(int v)        { qa.confidence = v; return this; }
            public Builder completeness(int v)      { qa.completeness = v; return this; }
            public Builder feedback(String v)       { qa.feedback = v; return this; }
            public Builder correctAnswer(String v)  { qa.correctAnswer = v; return this; }
            public Builder improvements(String v)   { qa.improvements = v; return this; }
            public Builder answered(boolean v)      { qa.answered = v; return this; }
            public QuestionAnswer build()           { return qa; }
        }
    }

    // ── FinalReport ──────────────────────────────────────────────────────────

    public static class FinalReport {
        private double overallScore;
        private String overallFeedback;
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> suggestions;
        private List<TopicScore> topicBreakdown;

        public FinalReport() {}

        public double getOverallScore() { return overallScore; }
        public void setOverallScore(double v) { this.overallScore = v; }
        public String getOverallFeedback() { return overallFeedback; }
        public void setOverallFeedback(String v) { this.overallFeedback = v; }
        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> v) { this.strengths = v; }
        public List<String> getWeaknesses() { return weaknesses; }
        public void setWeaknesses(List<String> v) { this.weaknesses = v; }
        public List<String> getSuggestions() { return suggestions; }
        public void setSuggestions(List<String> v) { this.suggestions = v; }
        public List<TopicScore> getTopicBreakdown() { return topicBreakdown; }
        public void setTopicBreakdown(List<TopicScore> v) { this.topicBreakdown = v; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final FinalReport r = new FinalReport();
            public Builder overallScore(double v)            { r.overallScore = v; return this; }
            public Builder overallFeedback(String v)         { r.overallFeedback = v; return this; }
            public Builder strengths(List<String> v)         { r.strengths = v; return this; }
            public Builder weaknesses(List<String> v)        { r.weaknesses = v; return this; }
            public Builder suggestions(List<String> v)       { r.suggestions = v; return this; }
            public Builder topicBreakdown(List<TopicScore> v){ r.topicBreakdown = v; return this; }
            public FinalReport build()                       { return r; }
        }
    }

    // ── TopicScore ───────────────────────────────────────────────────────────

    public static class TopicScore {
        private String topic;
        private int score;

        public TopicScore() {}

        public String getTopic() { return topic; }
        public void setTopic(String v) { this.topic = v; }
        public int getScore() { return score; }
        public void setScore(int v) { this.score = v; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final TopicScore t = new TopicScore();
            public Builder topic(String v) { t.topic = v; return this; }
            public Builder score(int v)    { t.score = v; return this; }
            public TopicScore build()      { return t; }
        }
    }
}
