package com.placement.interview.dto.response;

import com.placement.interview.model.InterviewSession;

public class InterviewStepResponse {
    private String sessionId;
    private int questionIndex;
    private int totalQuestions;
    private String question;
    private String domain;
    private String difficulty;
    private boolean isLastQuestion;
    private EvaluationResult evaluation;
    private InterviewSession.FinalReport finalReport;

    public InterviewStepResponse() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public int getQuestionIndex() { return questionIndex; }
    public void setQuestionIndex(int questionIndex) { this.questionIndex = questionIndex; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public boolean isLastQuestion() { return isLastQuestion; }
    public void setLastQuestion(boolean lastQuestion) { isLastQuestion = lastQuestion; }

    public EvaluationResult getEvaluation() { return evaluation; }
    public void setEvaluation(EvaluationResult evaluation) { this.evaluation = evaluation; }

    public InterviewSession.FinalReport getFinalReport() { return finalReport; }
    public void setFinalReport(InterviewSession.FinalReport finalReport) { this.finalReport = finalReport; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final InterviewStepResponse r = new InterviewStepResponse();
        public Builder sessionId(String v)                          { r.sessionId = v; return this; }
        public Builder questionIndex(int v)                         { r.questionIndex = v; return this; }
        public Builder totalQuestions(int v)                        { r.totalQuestions = v; return this; }
        public Builder question(String v)                           { r.question = v; return this; }
        public Builder domain(String v)                             { r.domain = v; return this; }
        public Builder difficulty(String v)                         { r.difficulty = v; return this; }
        public Builder isLastQuestion(boolean v)                    { r.isLastQuestion = v; return this; }
        public Builder evaluation(EvaluationResult v)               { r.evaluation = v; return this; }
        public Builder finalReport(InterviewSession.FinalReport v)  { r.finalReport = v; return this; }
        public InterviewStepResponse build()                        { return r; }
    }
}
