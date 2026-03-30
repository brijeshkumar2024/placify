package com.placement.user.repository;

import com.placement.user.model.UserAccount;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAccountRepository extends ReactiveMongoRepository<UserAccount, String> {
}
