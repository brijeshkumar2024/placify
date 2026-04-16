package com.placement.interview.repository;

import com.placement.interview.entity.StudentPerformance;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface StudentPerformanceRepository extends ReactiveMongoRepository<StudentPerformance, String> {
    Flux<StudentPerformance> findByStudentId(String studentId);
    Flux<StudentPerformance> findByStudentIdAndIsWeakAreaTrue(String studentId);
}
