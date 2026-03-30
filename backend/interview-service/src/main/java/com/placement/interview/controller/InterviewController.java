package com.placement.interview.controller;

import com.placement.interview.dto.request.StartInterviewRequest;
import com.placement.interview.dto.request.SubmitAnswerRequest;
import com.placement.interview.dto.response.ApiResponse;
import com.placement.interview.model.Notification;
import com.placement.interview.service.InterviewService;
import com.placement.interview.service.NotificationService;
import com.placement.interview.util.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private static final Logger logger = LoggerFactory.getLogger(InterviewController.class);

    private final InterviewService interviewService;
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    public InterviewController(InterviewService interviewService, NotificationService notificationService, JwtUtil jwtUtil) {
        this.interviewService = interviewService;
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/health")
    public Mono<ResponseEntity<ApiResponse<String>>> health() {
        return Mono.just(ResponseEntity.ok(ApiResponse.success("Interview service is running.", null)));
    }

    // POST /api/interview/start
    @PostMapping("/start")
    public Mono<ResponseEntity<ApiResponse<Object>>> startInterview(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody StartInterviewRequest request) {

        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return interviewService.startInterview(userId, request)
                .map(step -> ResponseEntity.ok(ApiResponse.success("Interview started.", (Object) step)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }

    // POST /api/interview/answer
    @PostMapping("/answer")
    public Mono<ResponseEntity<ApiResponse<Object>>> submitAnswer(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody SubmitAnswerRequest request) {

        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return interviewService.submitAnswer(userId, request)
                .map(step -> ResponseEntity.ok(ApiResponse.success("Answer submitted.", (Object) step)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }

    // GET /api/interview/report/{sessionId}
    @GetMapping("/report/{sessionId}")
    public Mono<ResponseEntity<ApiResponse<Object>>> getReport(
            @RequestHeader("Authorization") String token,
            @PathVariable String sessionId) {

        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return interviewService.getReport(sessionId, userId)
                .map(session -> ResponseEntity.ok(ApiResponse.success("Report fetched.", (Object) session)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }

    // GET /api/interview/history
    @GetMapping("/history")
    public Mono<ResponseEntity<ApiResponse<Object>>> getHistory(
            @RequestHeader("Authorization") String token) {

        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return interviewService.getHistory(userId)
                .collectList()
                .map(sessions -> ResponseEntity.ok(ApiResponse.success("History fetched.", (Object) sessions)));
    }

    // DELETE /api/interview/abandon/{sessionId}
    @DeleteMapping("/abandon/{sessionId}")
    public Mono<ResponseEntity<ApiResponse<Void>>> abandonSession(
            @RequestHeader("Authorization") String token,
            @PathVariable String sessionId) {

        String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        return interviewService.abandonSession(sessionId, userId)
                .then(Mono.just(ResponseEntity.ok(ApiResponse.<Void>success("Session abandoned.", null))))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest()
                        .body(ApiResponse.error(ex.getMessage()))));
    }

    // ── NOTIFICATIONS ────────────────────────────────────────────────────────
    @PostMapping("/notifications/create")
    public Mono<ResponseEntity<ApiResponse<Object>>> createNotification(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody com.placement.interview.dto.request.CreateNotificationRequest request) {
        String clean = token.replace("Bearer ", "");
        String role = jwtUtil.extractRole(clean);
        if (role == null || (!role.equals("TPO") && !role.equals("ADMIN"))) {
            return Mono.just(ResponseEntity.status(403).body(ApiResponse.error("Only TPO/Admin can create notifications.")));
        }
        String userId = jwtUtil.extractUserId(clean);
        return notificationService.create(userId, request)
                .map(n -> ResponseEntity.ok(ApiResponse.success("Notification created.", (Object) n)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @GetMapping("/notifications/student")
    public Mono<ResponseEntity<ApiResponse<Object>>> studentNotifications(
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (token == null || token.isBlank()) {
            logger.warn("studentNotifications: no authorization header provided. Returning public notifications.");
        } else {
            try {
                String clean = token.replace("Bearer ", "");
                String userId = jwtUtil.extractUserId(clean);
                logger.debug("studentNotifications: userId={} requested notifications", userId);
            } catch (Exception ex) {
                logger.warn("studentNotifications: invalid token provided; proceeding with public notifications", ex);
            }
        }

        return notificationService.getActive()
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("Notifications fetched.", (Object) list)))
                .onErrorResume(ex -> {
                    logger.error("studentNotifications: error fetching notifications", ex);
                    return Mono.just(ResponseEntity.status(500).body(ApiResponse.error("Unable to fetch notifications. Try again later.")));
                });
    }

    @DeleteMapping("/notifications/{id}")
    public Mono<ResponseEntity<ApiResponse<Object>>> deleteNotification(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        String clean = token.replace("Bearer ", "");
        String role = jwtUtil.extractRole(clean);
        if (role == null || (!role.equals("TPO") && !role.equals("ADMIN"))) {
            return Mono.just(ResponseEntity.status(403).body(ApiResponse.error("Only TPO/Admin can delete notifications.")));
        }
        return notificationService.delete(id)
                .thenReturn(ResponseEntity.ok(ApiResponse.success("Notification deleted.", null)));
    }
}
