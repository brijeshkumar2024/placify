package com.placement.user.repository;
import com.placement.user.model.StudentProfile;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
@Repository
public interface StudentProfileRepository extends ReactiveMongoRepository<StudentProfile, String> {
    Mono<StudentProfile> findByUserId(String userId);
    Mono<Boolean> existsByUserId(String userId);
}
