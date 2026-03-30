package com.placement.user.service;

import com.placement.user.dto.response.StudentProfileResponse;
import com.placement.user.model.StudentProfile;
import com.placement.user.model.UserAccount;
import com.placement.user.repository.StudentProfileRepository;
import com.placement.user.repository.UserAccountRepository;
import com.placement.user.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentProfileServiceTest {

    @Mock
    private StudentProfileRepository profileRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Test
    void getProfileHydratesRollNumberFromUserAccountWhenMissingInStudentProfile() {
        StudentProfileService service = new StudentProfileService(profileRepository, userAccountRepository, jwtUtil);

        StudentProfile profile = new StudentProfile();
        profile.setUserId("user-1");
        profile.setFullName("Alice Student");

        UserAccount userAccount = new UserAccount();
        userAccount.setId("user-1");
        userAccount.setEmail("alice@example.com");
        userAccount.setFullName("Alice Student");
        userAccount.setRollNumber("CS2021001");

        when(jwtUtil.extractUserId("token")).thenReturn("user-1");
        when(profileRepository.findByUserId("user-1")).thenReturn(Mono.just(profile));
        when(userAccountRepository.findById("user-1")).thenReturn(Mono.just(userAccount));
        when(profileRepository.save(any(StudentProfile.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.getProfile("Bearer token"))
                .assertNext(response -> assertHydratedResponse(response))
                .verifyComplete();

        verify(profileRepository).save(argThat(saved ->
                "CS2021001".equals(saved.getRollNumber())
                        && "alice@example.com".equals(saved.getEmail())));
    }

    private void assertHydratedResponse(StudentProfileResponse response) {
        assertEquals("Alice Student", response.getFullName());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals("CS2021001", response.getRollNumber());
    }
}
