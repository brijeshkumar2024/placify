package com.placement.placement.config;

import com.placement.placement.model.PlacementApplication;
import com.placement.placement.model.PlacementDrive;
import com.placement.placement.model.StudentPlacementStatus;
import com.placement.placement.repository.PlacementApplicationRepository;
import com.placement.placement.repository.PlacementDriveRepository;
import com.placement.placement.repository.StudentPlacementStatusRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class StartupSeeder {

    @Bean
    public CommandLineRunner seedPlacementData(PlacementApplicationRepository appRepo,
                                               PlacementDriveRepository driveRepo,
                                               StudentPlacementStatusRepository statusRepo) {
        return args -> {
            // seed only when there is no data
            Mono<Long> appCount = appRepo.count();
            appCount.flatMap(count -> {
                if (count > 0) return Mono.empty();

                // Sample drive
                PlacementDrive drive = new PlacementDrive();
                drive.setCompany("TechNova");
                drive.setJobId("JOB-DSA-1");
                drive.setTpoId("TPO-001");
                drive.setCollegeId("COLL-001");
                PlacementDrive.EligibilityRules rules = new PlacementDrive.EligibilityRules();
                rules.setMinCgpa(7.0);
                rules.setBranches(List.of("CSE", "IT"));
                rules.setGraduationYear(2026);
                rules.setMaxBacklogs(1);
                drive.setEligibilityRules(rules);
                drive.setRounds(Arrays.asList("OA", "Tech interview", "HR"));
                drive.setCurrentRound(1);
                drive.setStatus(PlacementDrive.DriveStatus.ACTIVE);
                drive.setRegisteredStudents(new ArrayList<>(List.of("S123", "S456")));
                drive.setPlacedStudents(new ArrayList<>());
                drive.setCreatedAt(Instant.now());
                drive.setDeadline(Instant.now().plusSeconds(86400 * 15));

                // Sample applications
                PlacementApplication a1 = new PlacementApplication();
                a1.setJobId("JOB-DSA-1");
                a1.setStudentId("S123");
                a1.setStudentEmail("s123@college.edu");
                a1.setStudentName("Amit Verma");
                a1.setStudentCgpa(8.1);
                a1.setStudentBranch("CSE");
                a1.setStudentSkills(List.of("Java", "DSA", "SQL"));
                a1.setStatus(PlacementApplication.ApplicationStatus.INTERVIEW);
                a1.setCurrentRound(2);
                a1.setRoundResults(new ArrayList<>(List.of("OA cleared", "Tech round scheduled")));
                a1.setFitScore(78);
                a1.setAppliedAt(Instant.now().minusSeconds(86400 * 5));
                a1.setUpdatedAt(Instant.now());

                PlacementApplication a2 = new PlacementApplication();
                a2.setJobId("JOB-DSA-1");
                a2.setStudentId("S456");
                a2.setStudentEmail("s456@college.edu");
                a2.setStudentName("Neha Singh");
                a2.setStudentCgpa(8.8);
                a2.setStudentBranch("IT");
                a2.setStudentSkills(List.of("Python", "DSA", "ML"));
                a2.setStatus(PlacementApplication.ApplicationStatus.OFFER);
                a2.setCurrentRound(3);
                a2.setRoundResults(new ArrayList<>(List.of("OA cleared", "Tech cleared", "HR cleared")));
                a2.setFitScore(86);
                a2.setAppliedAt(Instant.now().minusSeconds(86400 * 7));
                a2.setUpdatedAt(Instant.now());

                // Sample placement status
                StudentPlacementStatus s1 = new StudentPlacementStatus();
                s1.setStudentId("S123");
                s1.setPlaced(false);
                s1.setOnHold(false);
                s1.setOffersReceived(0);
                s1.setTotalApplications(1);
                s1.setActiveApplications(new ArrayList<>());
                s1.setCreatedAt(Instant.now());

                StudentPlacementStatus s2 = new StudentPlacementStatus();
                s2.setStudentId("S456");
                s2.setPlaced(true);
                s2.setPlacedCompany("TechNova");
                s2.setPlacedCtc(12.0);
                s2.setOffersReceived(1);
                s2.setOnHold(false);
                s2.setTotalApplications(1);
                s2.setActiveApplications(new ArrayList<>());
                s2.setCreatedAt(Instant.now());

                return driveRepo.save(drive)
                        .thenMany(appRepo.saveAll(List.of(a1, a2)))
                        .thenMany(statusRepo.saveAll(List.of(s1, s2)))
                        .then();
            }).block();
        };
    }
}
