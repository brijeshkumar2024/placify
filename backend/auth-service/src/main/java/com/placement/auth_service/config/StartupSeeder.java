package com.placement.auth_service.config;

import com.placement.auth_service.model.User;
import com.placement.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Mono;

@Configuration
public class StartupSeeder {

    @Value("${seed.tpo.email:tpo@placify.com}")
    private String tpoEmail;

    @Value("${seed.tpo.password:Placify@123}")
    private String tpoPassword;

    @Value("${seed.admin.email:admin@placify.com}")
    private String adminEmail;

    @Value("${seed.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${seed.student.email:2301020103@cgu-odisha.ac.in}")
    private String studentEmail;

    @Value("${seed.student.password:Placify@123}")
    private String studentPassword;

    @Bean
    public CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Mono<User> tpoSeed = upsertUser(userRepository, passwordEncoder, tpoEmail, tpoPassword, "Default TPO", User.Role.TPO);
            Mono<User> adminSeed = upsertUser(userRepository, passwordEncoder, adminEmail, adminPassword, "Default Admin", User.Role.ADMIN);
            Mono<User> studentSeed = upsertUser(userRepository, passwordEncoder, studentEmail, studentPassword, "Test Student", User.Role.STUDENT);

            tpoSeed.then(adminSeed).then(studentSeed).block();
        };
    }

    private Mono<User> upsertUser(UserRepository repo, PasswordEncoder encoder,
                                  String email, String rawPassword, String name, User.Role role) {
        return repo.findByEmail(email)
                .flatMap(existing -> {
                    // Respect existing users: do not overwrite password if already set
                    boolean hasPassword = existing.getPassword() != null && !existing.getPassword().isBlank();
                    if (!hasPassword) existing.setPassword(encoder.encode(rawPassword));
                    if (existing.getFullName() == null) existing.setFullName(name);
                    if (existing.getRole() == null) existing.setRole(role);
                    return repo.save(existing);
                })
                .switchIfEmpty(repo.save(User.builder()
                        .email(email)
                        .password(encoder.encode(rawPassword))
                        .fullName(name)
                        .role(role)
                        .status(User.AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .build()));
    }
}
