package com.placement.interview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.interview.dto.request.StartInterviewRequest;
import com.placement.interview.dto.request.SubmitAnswerRequest;
import com.placement.interview.dto.response.EvaluationResult;
import com.placement.interview.dto.response.InterviewStepResponse;
import com.placement.interview.exception.AppException;
import com.placement.interview.model.InterviewSession;
import com.placement.interview.model.InterviewSession.FinalReport;
import com.placement.interview.model.InterviewSession.QuestionAnswer;
import com.placement.interview.model.InterviewSession.SessionStatus;
import com.placement.interview.model.InterviewSession.TopicScore;
import com.placement.interview.repository.InterviewSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    public InterviewService(InterviewSessionRepository sessionRepository,
                            AIService aiService,
                            ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    // ── START INTERVIEW ──────────────────────────────────────────────────────

    public Mono<InterviewStepResponse> startInterview(String userId, StartInterviewRequest request) {
        int total = Math.min(Math.max(request.getTotalQuestions(), 3), 5); // clamp 3–5

        return aiService.generateQuestion(request.getDomain(), request.getDifficulty(),
                        List.of(), 1)
                .flatMap(question -> {
                    QuestionAnswer qa = QuestionAnswer.builder()
                            .index(0)
                            .question(question)
                            .answered(false)
                            .build();

                    InterviewSession session = InterviewSession.builder()
                            .userId(userId)
                            .domain(request.getDomain())
                            .difficulty(request.getDifficulty())
                            .totalQuestions(total)
                            .currentQuestionIndex(0)
                            .questionAnswers(new ArrayList<>(List.of(qa)))
                            .status(SessionStatus.IN_PROGRESS)
                            .build();

                    return sessionRepository.save(session);
                })
                .map(saved -> InterviewStepResponse.builder()
                        .sessionId(saved.getId())
                        .questionIndex(0)
                        .totalQuestions(saved.getTotalQuestions())
                        .question(saved.getQuestionAnswers().get(0).getQuestion())
                        .domain(saved.getDomain())
                        .difficulty(saved.getDifficulty())
                        .isLastQuestion(saved.getTotalQuestions() == 1)
                        .build());
    }

    // ── SUBMIT ANSWER ────────────────────────────────────────────────────────

    public Mono<InterviewStepResponse> submitAnswer(String userId, SubmitAnswerRequest request) {
        return sessionRepository.findById(request.getSessionId())
                .switchIfEmpty(Mono.error(new AppException("Session not found", HttpStatus.NOT_FOUND)))
                .flatMap(session -> {
                    if (!session.getUserId().equals(userId)) {
                        return Mono.error(new AppException("Unauthorized", HttpStatus.FORBIDDEN));
                    }
                    if (session.getStatus() != SessionStatus.IN_PROGRESS) {
                        return Mono.error(new AppException("Session is not active", HttpStatus.BAD_REQUEST));
                    }

                    int currentIndex = session.getCurrentQuestionIndex();
                    QuestionAnswer currentQA = session.getQuestionAnswers().get(currentIndex);
                    String question = currentQA.getQuestion();

                    // Evaluate the answer via AI
                    return aiService.evaluateAnswer(
                                    session.getDomain(), session.getDifficulty(),
                                    question, request.getAnswer())
                            .flatMap(evaluation -> {
                                // Update current QA with answer + evaluation
                                currentQA.setAnswer(request.getAnswer());
                                currentQA.setScore(evaluation.getScore());
                                currentQA.setTechnicalAccuracy(evaluation.getTechnicalAccuracy());
                                currentQA.setCommunication(evaluation.getCommunication());
                                currentQA.setConfidence(evaluation.getConfidence());
                                currentQA.setCompleteness(evaluation.getCompleteness());
                                currentQA.setFeedback(evaluation.getFeedback());
                                currentQA.setCorrectAnswer(evaluation.getCorrectAnswer());
                                currentQA.setImprovements(evaluation.getImprovements());
                                currentQA.setAnswered(true);

                                boolean isLast = currentIndex + 1 >= session.getTotalQuestions();

                                if (isLast) {
                                    return finishSession(session, evaluation);
                                } else {
                                    return continueSession(session, currentIndex, evaluation);
                                }
                            });
                });
    }

    // ── GET REPORT ───────────────────────────────────────────────────────────

    public Mono<InterviewSession> getReport(String sessionId, String userId) {
        return sessionRepository.findById(sessionId)
                .switchIfEmpty(Mono.error(new AppException("Session not found", HttpStatus.NOT_FOUND)))
                .flatMap(session -> {
                    if (!session.getUserId().equals(userId)) {
                        return Mono.error(new AppException("Unauthorized", HttpStatus.FORBIDDEN));
                    }
                    return Mono.just(session);
                });
    }

    // ── GET HISTORY ──────────────────────────────────────────────────────────

    public Flux<InterviewSession> getHistory(String userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── ABANDON SESSION ──────────────────────────────────────────────────────

    public Mono<Void> abandonSession(String sessionId, String userId) {
        return sessionRepository.findById(sessionId)
                .switchIfEmpty(Mono.error(new AppException("Session not found", HttpStatus.NOT_FOUND)))
                .flatMap(session -> {
                    if (!session.getUserId().equals(userId)) {
                        return Mono.error(new AppException("Unauthorized", HttpStatus.FORBIDDEN));
                    }
                    session.setStatus(SessionStatus.ABANDONED);
                    session.setCompletedAt(Instant.now());
                    return sessionRepository.save(session);
                })
                .then();
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private Mono<InterviewStepResponse> continueSession(InterviewSession session,
                                                         int currentIndex,
                                                         EvaluationResult evaluation) {
        int nextIndex = currentIndex + 1;
        List<String> previousQuestions = session.getQuestionAnswers().stream()
                .map(QuestionAnswer::getQuestion)
                .collect(Collectors.toList());

        return aiService.generateQuestion(
                        session.getDomain(), session.getDifficulty(),
                        previousQuestions, nextIndex + 1)
                .flatMap(nextQuestion -> {
                    QuestionAnswer nextQA = QuestionAnswer.builder()
                            .index(nextIndex)
                            .question(nextQuestion)
                            .answered(false)
                            .build();

                    session.getQuestionAnswers().add(nextQA);
                    session.setCurrentQuestionIndex(nextIndex);

                    return sessionRepository.save(session)
                            .map(saved -> InterviewStepResponse.builder()
                                    .sessionId(saved.getId())
                                    .questionIndex(nextIndex)
                                    .totalQuestions(saved.getTotalQuestions())
                                    .question(nextQuestion)
                                    .domain(saved.getDomain())
                                    .difficulty(saved.getDifficulty())
                                    .isLastQuestion(nextIndex + 1 >= saved.getTotalQuestions())
                                    .evaluation(evaluation)
                                    .build());
                });
    }

    private Mono<InterviewStepResponse> finishSession(InterviewSession session,
                                                       EvaluationResult lastEvaluation) {
        List<Map<String, Object>> qaList = session.getQuestionAnswers().stream()
                .filter(QuestionAnswer::isAnswered)
                    .map(qa -> Map.<String, Object>of(
                        "question", qa.getQuestion(),
                        "answer", qa.getAnswer() != null ? qa.getAnswer() : "",
                        "score", qa.getScore()))
                .collect(Collectors.toList());

        return aiService.generateFinalReport(session.getDomain(), session.getDifficulty(), qaList)
                .map(reportJson -> parseFinalReport(reportJson, session))
                .flatMap(finalReport -> {
                    session.setFinalReport(finalReport);
                    session.setStatus(SessionStatus.COMPLETED);
                    session.setCompletedAt(Instant.now());
                    return sessionRepository.save(session);
                })
                .map(saved -> InterviewStepResponse.builder()
                        .sessionId(saved.getId())
                        .questionIndex(saved.getCurrentQuestionIndex())
                        .totalQuestions(saved.getTotalQuestions())
                        .domain(saved.getDomain())
                        .difficulty(saved.getDifficulty())
                        .isLastQuestion(true)
                        .evaluation(lastEvaluation)
                        .finalReport(saved.getFinalReport())
                        .build());
    }

    private FinalReport parseFinalReport(String rawText, InterviewSession session) {
        try {
            String json = rawText;
            if (rawText.contains("```json")) {
                json = rawText.substring(rawText.indexOf("```json") + 7);
                json = json.substring(0, json.indexOf("```")).trim();
            } else if (rawText.contains("{")) {
                json = rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1);
            }

            JsonNode node = objectMapper.readTree(json);

            List<String> strengths = new ArrayList<>();
            node.path("strengths").forEach(n -> strengths.add(n.asText()));

            List<String> weaknesses = new ArrayList<>();
            node.path("weaknesses").forEach(n -> weaknesses.add(n.asText()));

            List<String> suggestions = new ArrayList<>();
            node.path("suggestions").forEach(n -> suggestions.add(n.asText()));

            // Calculate overall score from individual scores
            double avgScore = session.getQuestionAnswers().stream()
                    .filter(QuestionAnswer::isAnswered)
                    .mapToInt(QuestionAnswer::getScore)
                    .average()
                    .orElse(5.0);
            double overallScore = Math.round(avgScore * 10.0); // convert 0-10 to 0-100

            // Topic breakdown
            List<TopicScore> topicBreakdown = session.getQuestionAnswers().stream()
                    .filter(QuestionAnswer::isAnswered)
                    .map(qa -> TopicScore.builder()
                            .topic("Q" + (qa.getIndex() + 1))
                            .score(qa.getScore() * 10)
                            .build())
                    .collect(Collectors.toList());

            return FinalReport.builder()
                    .overallScore(overallScore)
                    .overallFeedback(node.path("overallFeedback").asText("Interview completed."))
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .suggestions(suggestions)
                    .topicBreakdown(topicBreakdown)
                    .build();

        } catch (Exception e) {
            throw new AppException("Failed to parse AI final report: " + e.getMessage(),
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
