package com.placement.job;

import com.placement.job.dto.request.ScheduleInterviewRequest;
import com.placement.job.model.Application;
import com.placement.job.model.Interview;
import com.placement.job.repository.ApplicationRepository;
import com.placement.job.repository.InterviewRepository;
import com.placement.job.repository.JobRepository;
import com.placement.job.service.EmailService;
import com.placement.job.service.PlacementSyncService;
import com.placement.job.service.RecruiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecruiterServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private PlacementSyncService placementSyncService;

    @Mock
    private EmailService emailService;

    private RecruiterService recruiterService;

    @BeforeEach
    void setUp() {
        recruiterService = new RecruiterService(
                jobRepository,
                applicationRepository,
                interviewRepository,
                placementSyncService,
                emailService
        );
    }

    @Test
    void scheduleInterviewUpdatesApplicationStatusAndPersistsInterview() {
        ScheduleInterviewRequest request = new ScheduleInterviewRequest();
        request.setApplicationId("app-123");
        request.setStudentEmail("student@example.com");
        request.setDateTime(LocalDateTime.of(2026, 3, 31, 20, 40));
        request.setMessage("Please join 10 minutes early.");

        Application application = new Application();
        application.setId("app-123");
        application.setJobId("job-789");
        application.setStudentId("student-456");
        application.setCompany("Acme Corp");
        application.setRole("Backend Intern");
        application.setStatus(Application.ApplicationStatus.APPLIED);

        when(applicationRepository.findById("app-123")).thenReturn(Mono.just(application));
        when(applicationRepository.save(any(Application.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));
        when(interviewRepository.save(any(Interview.class)))
                .thenAnswer(invocation -> {
                    Interview interview = invocation.getArgument(0);
                    interview.setId("int-001");
                    return Mono.just(interview);
                });
        when(placementSyncService.syncStatusUpdate(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Mono.empty());
        when(emailService.sendInterviewScheduled(anyString(), anyString(), anyString(), any(), anyString()))
                .thenReturn(Mono.empty());

        Interview savedInterview = recruiterService.scheduleInterview(request).block();

        assertNotNull(savedInterview);
        assertEquals("int-001", savedInterview.getId());
        assertEquals(Interview.InterviewStatus.SCHEDULED, savedInterview.getStatus());
        assertEquals("app-123", savedInterview.getApplicationId());
        assertNotNull(savedInterview.getScheduledAt());

        ArgumentCaptor<Application> applicationCaptor = ArgumentCaptor.forClass(Application.class);
        verify(applicationRepository).save(applicationCaptor.capture());

        Application savedApplication = applicationCaptor.getValue();
        assertEquals(Application.ApplicationStatus.INTERVIEW, savedApplication.getStatus());
        assertNotNull(savedApplication.getInterviewDateTime());

        verify(interviewRepository).save(any(Interview.class));
        verify(placementSyncService).syncStatusUpdate(
                eq("student-456"),
                eq("job-789"),
                eq("INTERVIEW"),
                eq("Acme Corp")
        );
        verify(emailService).sendInterviewScheduled(
                eq("student@example.com"),
                eq("Acme Corp"),
                eq("Backend Intern"),
                any(),
                eq("Please join 10 minutes early.")
        );
    }
}
