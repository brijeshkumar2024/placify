package com.placement.placement.repository;

import com.placement.placement.model.StudentPlacementStatus;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface StudentPlacementStatusRepository extends ReactiveMongoRepository<StudentPlacementStatus, String> {
    Mono<StudentPlacementStatus> findByStudentId(String studentId);
    Mono<Long> countByPlaced(boolean placed);
    Mono<Long> countByOnHold(boolean onHold);
    Flux<StudentPlacementStatus> findByPlacedFalseAndOnHoldTrue();
    Flux<StudentPlacementStatus> findByPlacedFalse();
}
