package com.placement.job.repository;

import com.placement.job.model.Interview;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface InterviewRepository extends ReactiveMongoRepository<Interview, String> {
    Flux<Interview> findByApplicationId(String applicationId);
}
