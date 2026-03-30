package com.placement.placement.repository;

import com.placement.placement.model.PlacementDrive;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface PlacementDriveRepository extends ReactiveMongoRepository<PlacementDrive, String> {
    Mono<Long> countByStatus(PlacementDrive.DriveStatus status);
}
