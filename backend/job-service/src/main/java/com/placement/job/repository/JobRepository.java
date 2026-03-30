package com.placement.job.repository;
import com.placement.job.model.Job;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
@Repository
public interface JobRepository extends ReactiveMongoRepository<Job, String> {
    Flux<Job> findByStatus(Job.JobStatus status);
    Flux<Job> findByStatusAndMinCgpaLessThanEqual(Job.JobStatus status, double cgpa);
    Flux<Job> findByPostedBy(String recruiterId);
    Flux<Job> findByPostedByAndStatus(String recruiterId, Job.JobStatus status);
    @Query("{ 'company': { $regex: ?0, $options: 'i' } }")
    Flux<Job> findByCompanyRegex(String company);
}
