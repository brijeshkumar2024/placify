package com.placement.interview.repository;

import com.placement.interview.model.InterviewSession;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface InterviewSessionRepository extends ReactiveMongoRepository<InterviewSession, String> {
    Flux<InterviewSession> findByUserIdOrderByCreatedAtDesc(String userId);
    Flux<InterviewSession> findByUserIdAndStatus(String userId, InterviewSession.SessionStatus status);
    Mono<Long> countByUserIdAndStatus(String userId, InterviewSession.SessionStatus status);
}
