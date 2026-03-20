package com.placement.auth_service.repository;
import com.placement.auth_service.model.College;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
@Repository
public interface CollegeRepository extends ReactiveMongoRepository<College, String> {
    Mono<College> findByAllowedDomainsContaining(String domain);
    Mono<Boolean> existsByAllowedDomainsContaining(String domain);
}