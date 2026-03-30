package com.placement.placement.repository;

import com.placement.placement.model.StudentRecord;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface StudentRecordRepository extends ReactiveMongoRepository<StudentRecord, String> {
    Mono<Boolean> existsByRollNumber(String rollNumber);
    Mono<Boolean> existsByEmail(String email);
    Mono<StudentRecord> findByEmail(String email);
}
