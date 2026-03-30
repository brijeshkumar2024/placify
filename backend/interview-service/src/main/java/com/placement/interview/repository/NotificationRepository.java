package com.placement.interview.repository;

import com.placement.interview.model.Notification;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

import java.time.Instant;

public interface NotificationRepository extends ReactiveMongoRepository<Notification, String> {
    Flux<Notification> findByExpiryDateAfterOrderByCreatedAtDesc(Instant now);
}
