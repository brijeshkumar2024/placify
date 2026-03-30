package com.placement.interview.service;

import com.placement.interview.dto.request.CreateNotificationRequest;
import com.placement.interview.model.Notification;
import com.placement.interview.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public Mono<Notification> create(String creatorId, CreateNotificationRequest req) {
        Notification n = new Notification();
        n.setTitle(req.getTitle());
        n.setMessage(req.getMessage());
        n.setType(req.getType());
        n.setAudience(req.getAudience());
        n.setCreatedAt(Instant.now());
        n.setCreatedBy(creatorId);
        int days = Math.max(1, Math.min(req.getDurationDays(), 60));
        n.setExpiryDate(n.getCreatedAt().plusSeconds(days * 24L * 3600L));
        return repository.save(n);
    }

    public Flux<Notification> getActive() {
        return repository.findByExpiryDateAfterOrderByCreatedAtDesc(Instant.now());
    }

    public Mono<Void> delete(String id) {
        return repository.deleteById(id);
    }
}
