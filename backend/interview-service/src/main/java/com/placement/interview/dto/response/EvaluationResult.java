package com.placement.interview.dto.response;

public class EvaluationResult {
    private int score;
    private int technicalAccuracy;
    private int communication;
    private int confidence;
    private int completeness;
    private String feedback;
    private String correctAnswer;
    private String improvements;

    public EvaluationResult() {}

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTechnicalAccuracy() { return technicalAccuracy; }
    public void setTechnicalAccuracy(int technicalAccuracy) { this.technicalAccuracy = technicalAccuracy; }

    public int getCommunication() { return communication; }
    public void setCommunication(int communication) { this.communication = communication; }

    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }

    public int getCompleteness() { return completeness; }
    public void setCompleteness(int completeness) { this.completeness = completeness; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getImprovements() { return improvements; }
    public void setImprovements(String improvements) { this.improvements = improvements; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final EvaluationResult e = new EvaluationResult();
        public Builder score(int v)              { e.score = v; return this; }
        public Builder technicalAccuracy(int v)  { e.technicalAccuracy = v; return this; }
        public Builder communication(int v)      { e.communication = v; return this; }
        public Builder confidence(int v)         { e.confidence = v; return this; }
        public Builder completeness(int v)       { e.completeness = v; return this; }
        public Builder feedback(String v)        { e.feedback = v; return this; }
        public Builder correctAnswer(String v)   { e.correctAnswer = v; return this; }
        public Builder improvements(String v)    { e.improvements = v; return this; }
        public EvaluationResult build()          { return e; }
    }
}
