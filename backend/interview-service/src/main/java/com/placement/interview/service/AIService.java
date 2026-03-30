package com.placement.interview.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.interview.dto.response.EvaluationResult;
import com.placement.interview.exception.AppException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final WebClient nvidiaWebClient;
    private final ObjectMapper objectMapper;

    @Value("${nvidia.api.model}")
    private String model;

    @Value("${nvidia.api.key}")
    private String apiKey;

    private static final int MIN_ANSWER_LENGTH = 10;

    public AIService(WebClient nvidiaWebClient, ObjectMapper objectMapper) {
        this.nvidiaWebClient = nvidiaWebClient;
        this.objectMapper = objectMapper;
    }

    // ── QUESTION GENERATION ──────────────────────────────────────────────────

    public Mono<String> generateQuestion(String domain, String difficulty,
                                         List<String> previousQuestions, int questionNumber) {
        log.info("[AI] Generating question #{} | domain={} difficulty={}", questionNumber, domain, difficulty);
        log.debug("[AI] Model: {} | API key configured: {}", model, apiKey != null && !apiKey.isBlank());

        String prompt = buildQuestionPrompt(domain, difficulty, previousQuestions, questionNumber);
        return callAI(prompt, 0.8)
                .map(this::extractTextContent)
                .map(String::trim)
                .doOnNext(q -> log.debug("[AI] Generated question: {}", q))
                .onErrorMap(ex -> !(ex instanceof AppException),
                        ex -> new AppException(
                                "AI question generation failed: " + ex.getMessage(),
                                HttpStatus.SERVICE_UNAVAILABLE))
                .onErrorResume(ex -> {
                    log.warn("[AI] Fallback question used due to error: {}", ex.getMessage());
                    return Mono.just("AI temporarily unavailable. Please try again later.");
                });
    }

    // ── ANSWER EVALUATION ────────────────────────────────────────────────────

    public Mono<EvaluationResult> evaluateAnswer(String domain, String difficulty,
                                                  String question, String answer) {
        String trimmed = answer == null ? "" : answer.trim();

        log.info("[AI] Evaluating answer | domain={} difficulty={} answerLen={}", domain, difficulty, trimmed.length());

        // Short answer — fail fast per requirement
        if (trimmed.length() < MIN_ANSWER_LENGTH) {
            log.warn("[AI] Answer too short ({} chars) → score 1", trimmed.length());
            return Mono.just(EvaluationResult.builder()
                    .score(1)
                    .technicalAccuracy(0).communication(0).confidence(0).completeness(0)
                    .feedback("Answer is too short. A meaningful response is required.")
                    .correctAnswer("Please provide a detailed answer.")
                    .improvements("Write at least 2-3 sentences explaining your understanding.")
                    .build());
        }

        log.info("[AI] Calling NVIDIA AI for evaluation");
        String prompt = buildEvaluationPrompt(domain, difficulty, question, trimmed);

        // temperature=0.1 → deterministic, strict scoring
        return callAI(prompt, 0.1)
                .map(this::extractTextContent)
                .doOnNext(raw -> log.debug("[AI] Raw evaluation response received ({} chars)", raw.length()))
                .map(this::parseEvaluation)
                .doOnNext(r -> log.info("[AI] Evaluation scores → score={} tech={} comm={} conf={} comp={}", 
                        r.getScore(), r.getTechnicalAccuracy(), r.getCommunication(),
                        r.getConfidence(), r.getCompleteness()))
                .onErrorMap(ex -> !(ex instanceof AppException),
                        ex -> new AppException(
                                "AI evaluation failed: " + ex.getMessage(),
                                HttpStatus.SERVICE_UNAVAILABLE))
                .onErrorResume(ex -> {
                    log.warn("[AI] Fallback evaluation due to error: {}", ex.getMessage());
                    return Mono.just(EvaluationResult.builder()
                            .score(50)
                            .technicalAccuracy(50)
                            .communication(50)
                            .confidence(50)
                            .completeness(50)
                            .feedback("AI is temporarily unavailable. Please try again later.")
                            .correctAnswer("N/A")
                            .improvements("Please retry in a few moments.")
                            .build());
                });
    }

    // ── FINAL REPORT GENERATION ──────────────────────────────────────────────

    public Mono<String> generateFinalReport(String domain, String difficulty,
                                             List<Map<String, Object>> qaList) {
        log.info("[AI] Generating final report | domain={} questions={}", domain, qaList.size());

        String prompt = buildFinalReportPrompt(domain, difficulty, qaList);
        return callAI(prompt, 0.4)
                .map(this::extractTextContent)
                .map(String::trim)
                .doOnNext(r -> log.debug("[AI] Final report generated ({} chars)", r.length()))
                .onErrorMap(ex -> !(ex instanceof AppException),
                        ex -> new AppException(
                                "AI report generation failed: " + ex.getMessage(),
                                HttpStatus.SERVICE_UNAVAILABLE))
                .onErrorResume(ex -> {
                    log.warn("[AI] Fallback final report due to error: {}", ex.getMessage());
                    return Mono.just("{\"message\": \"AI temporarily unavailable. Please try again later.\"}");
                });
    }

    // ── NVIDIA API CALL ──────────────────────────────────────────────────────

    private Mono<String> callAI(String userPrompt, double temperature) {
        String effectiveKey = System.getenv().getOrDefault("NVIDIA_API_KEY", apiKey);
        log.debug("[AI] NVIDIA_API_KEY source: {}", System.getenv("NVIDIA_API_KEY") != null ? "env" : "config");
        if (effectiveKey == null || effectiveKey.isBlank() || effectiveKey.equals("placeholder")) {
            log.error("[AI] NVIDIA_API_KEY is not configured or is placeholder");
            throw new AppException("NVIDIA_API_KEY is not configured", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Use LinkedHashMap to preserve field order in JSON
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", List.of(
                Map.of("role", "user",   "content", userPrompt)
        ));
        body.put("temperature", temperature);
        body.put("top_p", 0.9);
        body.put("max_tokens", 512);
        body.put("stream", false);

        try {
            log.debug("[AI] Request body: {}", objectMapper.writeValueAsString(body));
        } catch (JsonProcessingException e) {
            log.warn("[AI] Could not serialize request body: {}", e.getMessage());
        }

        return nvidiaWebClient.mutate()
                .defaultHeader("Authorization", "Bearer " + effectiveKey)
                .build()
                .post()
                .uri("https://integrate.api.nvidia.com/v1/chat/completions")
                .bodyValue(body)
                .retrieve()
                .onStatus(
                        status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .doOnNext(err -> log.error("[AI] NVIDIA API error response: {}", err))
                                .map(err -> new AppException(
                                        "NVIDIA API error: " + err,
                                        HttpStatus.SERVICE_UNAVAILABLE)))
                .bodyToMono(String.class)
                .doOnNext(raw -> log.debug("[AI] Raw HTTP response received ({} chars)", raw.length()))
                .timeout(Duration.ofSeconds(60))
                .onErrorMap(TimeoutException.class,
                        ex -> new AppException(
                                "AI request timed out after 60s. Please try again.",
                                HttpStatus.GATEWAY_TIMEOUT));
    }

    // ── RESPONSE PARSING ─────────────────────────────────────────────────────

    private String extractTextContent(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode choices = root.path("choices");
            if (choices.isEmpty()) {
                log.error("[AI] 'choices' array is empty in response");
                throw new AppException("AI returned empty choices", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            String content = choices.get(0).path("message").path("content").asText();
            if (content == null || content.isBlank()) {
                log.error("[AI] content field is blank");
                throw new AppException("AI returned blank content", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            log.debug("[AI] Extracted content ({} chars)", content.length());
            return content;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("[AI] Parse error: {} | raw: {}", e.getMessage(), jsonResponse);
            throw new AppException("Failed to parse AI response: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private EvaluationResult parseEvaluation(String rawText) {
        String json = extractJson(rawText);
        log.debug("[AI] Parsing evaluation JSON ({} chars)", json.length());

        try {
            JsonNode node = objectMapper.readTree(json);

            if (!node.has("score")) {
                log.error("[AI] 'score' field missing in AI response JSON");
                throw new AppException(
                        "AI response missing 'score' field. Raw: " + rawText,
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }

            int score           = clamp(node.path("score").asInt(), 0, 10);
            int techAccuracy    = clamp(node.path("technicalAccuracy").asInt(score * 10), 0, 100);
            int communication   = clamp(node.path("communication").asInt(score * 10), 0, 100);
            int confidence      = clamp(node.path("confidence").asInt(score * 10), 0, 100);
            int completeness    = clamp(node.path("completeness").asInt(score * 10), 0, 100);

            log.debug("[AI] Parsed scores → score={} tech={} comm={} conf={} comp={}",
                    score, techAccuracy, communication, confidence, completeness);

            return EvaluationResult.builder()
                    .score(score)
                    .technicalAccuracy(techAccuracy)
                    .communication(communication)
                    .confidence(confidence)
                    .completeness(completeness)
                    .feedback(node.path("feedback").asText("No feedback."))
                    .correctAnswer(node.path("correctAnswer").asText(""))
                    .improvements(node.path("improvements").asText(""))
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("[AI] JSON parse failed: {} | json: {}", e.getMessage(), json);
            throw new AppException(
                    "Failed to parse AI evaluation JSON: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ── VALIDATION ───────────────────────────────────────────────────────────

    private boolean isNonsenseAnswer(String answer) {
        if (!answer.contains(" ")) return true;                          // single word
        if (answer.split("\\s+").length < 3) return true;               // fewer than 3 words
        long unique = answer.chars().distinct().count();
        if (unique < 4) return true;                                     // keyboard mashing
        long letters = answer.chars().filter(Character::isLetter).count();
        return (double) letters / answer.length() < 0.6;                // mostly non-letters
    }

    private String extractJson(String rawText) {
        if (rawText.contains("```json")) {
            int s = rawText.indexOf("```json") + 7;
            int e = rawText.indexOf("```", s);
            if (e > s) return rawText.substring(s, e).trim();
        }
        if (rawText.contains("```")) {
            int s = rawText.indexOf("```") + 3;
            int e = rawText.indexOf("```", s);
            if (e > s) return rawText.substring(s, e).trim();
        }
        int s = rawText.indexOf("{");
        int e = rawText.lastIndexOf("}");
        if (s >= 0 && e > s) return rawText.substring(s, e + 1).trim();
        return rawText;
    }

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    // ── PROMPTS ──────────────────────────────────────────────────────────────

    private String getSystemPrompt() {
        return """
                You are a STRICT FAANG-level technical interviewer for campus placements.
                Evaluate answers HONESTLY and STRICTLY. Do NOT be lenient.
                A weak, vague, or one-word answer MUST receive a LOW score (0-3).
                Respond ONLY in the exact JSON format requested. No extra text.
                """;
    }

    private String buildQuestionPrompt(String domain, String difficulty,
                                        List<String> previousQuestions, int questionNumber) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("""
                Generate interview question #%d for a campus placement interview.

                Domain: %s (%s)
                Difficulty: %s (%s)

                Rules:
                - Ask exactly ONE clear, specific question
                - FAANG campus interview style
                - Do NOT repeat previous question topics
                - Do NOT include the answer
                - Return ONLY the question text, nothing else

                """,
                questionNumber,
                domain, getDomainDescription(domain),
                difficulty, getDifficultyDescription(difficulty)));

        if (!previousQuestions.isEmpty()) {
            sb.append("Already asked (DO NOT repeat):\n");
            previousQuestions.forEach(q -> sb.append("- ").append(q).append("\n"));
        }
        return sb.toString();
    }

    private String buildEvaluationPrompt(String domain, String difficulty,
                                          String question, String answer) {
        return String.format("""
                You are a STRICT FAANG-level technical interviewer. Evaluate strictly.

                Domain: %s
                Difficulty: %s

                Question:
                %s

                Candidate Answer:
                %s

                STRICT Scoring Rules:
                - Irrelevant, nonsense, or off-topic answer → score 0-2
                - Too vague, barely touches the topic → score 1-3
                - Partially correct, missing key points → score 4-6
                - Mostly correct with minor gaps → score 7-8
                - Complete, accurate, well-explained → score 9-10

                DO NOT give scores above 3 for weak answers.
                A short answer like "I don't know" or "few" = score 0-1.

                Respond with ONLY this JSON, no other text:
                {
                  "score": <integer 0-10>,
                  "technicalAccuracy": <integer 0-100>,
                  "communication": <integer 0-100>,
                  "confidence": <integer 0-100>,
                  "completeness": <integer 0-100>,
                  "feedback": "<2-3 sentences of specific honest feedback>",
                  "correctAnswer": "<ideal answer in 3-5 sentences>",
                  "improvements": "<one specific actionable improvement tip>"
                }
                """, domain, difficulty, question, answer);
    }

    private String buildFinalReportPrompt(String domain, String difficulty,
                                           List<Map<String, Object>> qaList) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("""
                Generate a comprehensive interview performance report.

                Domain: %s | Difficulty: %s

                Interview Q&A:
                """, domain, difficulty));

        for (int i = 0; i < qaList.size(); i++) {
            Map<String, Object> qa = qaList.get(i);
            sb.append(String.format("\nQ%d: %s\nAnswer: %s\nScore: %s/10\n",
                    i + 1, qa.get("question"), qa.get("answer"), qa.get("score")));
        }

        sb.append("""

                Respond ONLY with this JSON, no other text:
                {
                  "overallFeedback": "<2-3 sentence honest performance summary>",
                  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
                  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
                  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
                }
                """);
        return sb.toString();
    }

    private String getDomainDescription(String domain) {
        return switch (domain) {
            case "DSA"           -> "Data Structures & Algorithms";
            case "SYSTEM_DESIGN" -> "System Design & Scalability";
            case "HR"            -> "HR & Behavioural";
            case "CORE_CS"       -> "OS, DBMS, Networks, OOP";
            default              -> domain;
        };
    }

    private String getDifficultyDescription(String difficulty) {
        return switch (difficulty) {
            case "EASY"   -> "entry-level, conceptual";
            case "MEDIUM" -> "intermediate, applied";
            case "HARD"   -> "advanced, complex";
            default       -> difficulty;
        };
    }
}
