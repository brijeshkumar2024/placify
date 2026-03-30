package com.placement.placement.repository;

import com.placement.placement.model.PlacementApplication;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PlacementApplicationRepository extends ReactiveMongoRepository<PlacementApplication, String> {
    Mono<Boolean> existsByJobIdAndStudentId(String jobId, String studentId);
    Flux<PlacementApplication> findByStudentId(String studentId);
    Flux<PlacementApplication> findByJobId(String jobId);
    Mono<Long> countByStatus(PlacementApplication.ApplicationStatus status);
    Mono<Long> countByJobId(String jobId);
    Flux<PlacementApplication> findByStudentIdOrderByAppliedAtDesc(String studentId);
}
