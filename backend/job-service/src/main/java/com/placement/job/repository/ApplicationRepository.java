package com.placement.job.repository;
import com.placement.job.model.Application;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
@Repository
public interface ApplicationRepository extends ReactiveMongoRepository<Application, String> {
    Flux<Application> findByStudentId(String studentId);
    Flux<Application> findByJobId(String jobId);
    Mono<Boolean> existsByJobIdAndStudentId(String jobId, String studentId);
}