package com.placement.placement.service;

import com.placement.placement.dto.request.*;
import com.placement.placement.dto.response.StatsResponse;
import com.placement.placement.exception.AppException;
import com.placement.placement.model.*;
import com.placement.placement.repository.*;
import com.placement.placement.util.JwtUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.core.io.buffer.DataBufferUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlacementService {

    private static final Logger log = LoggerFactory.getLogger(PlacementService.class);

    private final PlacementApplicationRepository applicationRepository;
    private final PlacementDriveRepository driveRepository;
    private final StudentPlacementStatusRepository statusRepository;
    private final StudentRecordRepository studentRecordRepository;
    private final JwtUtil jwtUtil;

    public PlacementService(PlacementApplicationRepository applicationRepository,
                            PlacementDriveRepository driveRepository,
                            StudentPlacementStatusRepository statusRepository,
                            StudentRecordRepository studentRecordRepository,
                            JwtUtil jwtUtil) {
        this.applicationRepository = applicationRepository;
        this.driveRepository = driveRepository;
        this.statusRepository = statusRepository;
        this.studentRecordRepository = studentRecordRepository;
        this.jwtUtil = jwtUtil;
    }

    // ✅ INTERNAL SYNC — called by job-service when recruiter updates status
    public Mono<Void> syncStudentStatus(String studentId, String status, String company) {
        if (studentId == null || studentId.isBlank() || status == null) {
            log.warn("[PlacementSync] Skipping — null studentId or status");
            return Mono.empty();
        }
        log.info("[PlacementSync] Updating StudentPlacementStatus | studentId={} status={}", studentId, status);

        return statusRepository.findByStudentId(studentId)
                .defaultIfEmpty(new StudentPlacementStatus())
                .flatMap(s -> {
                    if (s.getStudentId() == null) s.setStudentId(studentId);
                    if (s.getCreatedAt() == null) s.setCreatedAt(Instant.now());

                    switch (status.toUpperCase()) {
                        case "SHORTLISTED" -> {
                            s.setShortlistedCount((s.getShortlistedCount() != null ? s.getShortlistedCount() : 0) + 1);
                            log.debug("[PlacementSync] shortlistedCount incremented for studentId={}", studentId);
                        }
                        case "INTERVIEW"   -> {
                            s.setInterviewCount((s.getInterviewCount() != null ? s.getInterviewCount() : 0) + 1);
                            log.debug("[PlacementSync] interviewCount incremented for studentId={}", studentId);
                        }
                        case "OFFER", "HIRED" -> {
                            s.setOffersReceived((s.getOffersReceived() != null ? s.getOffersReceived() : 0) + 1);
                            s.setPlaced(true);
                            if (company != null && !company.isBlank()) s.setPlacedCompany(company);
                            log.debug("[PlacementSync] offersReceived incremented, placed=true for studentId={}", studentId);
                        }
                        case "REJECTED" -> {
                            s.setRejectedCount((s.getRejectedCount() != null ? s.getRejectedCount() : 0) + 1);
                            log.debug("[PlacementSync] rejectedCount incremented for studentId={}", studentId);
                        }
                        case "HOLD"     -> {
                            s.setOnHold(true);
                            log.debug("[PlacementSync] onHold=true for studentId={}", studentId);
                        }
                        default -> {
                            log.warn("[PlacementSync] Unknown status '{}' — skipping update", status);
                            return Mono.empty();
                        }
                    }
                    return statusRepository.save(s)
                            .doOnSuccess(saved -> log.info("[PlacementSync] ✅ Saved StudentPlacementStatus | studentId={} status={}", studentId, status));
                })
                .then();
    }

    // ✅ APPLY (JWT + SAFE)
    public Mono<PlacementApplication> apply(String token, String jobId, ApplyPlacementRequest request) {

        String cleanToken = token.replace("Bearer ", "");

        if (!jwtUtil.isTokenValid(cleanToken)) {
            return Mono.error(new AppException("Invalid token", HttpStatus.UNAUTHORIZED));
        }

        String studentId = jwtUtil.extractUserId(cleanToken);
        String email = jwtUtil.extractEmail(cleanToken);

        return applicationRepository.existsByJobIdAndStudentId(jobId, studentId)
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new AppException("You already applied.", HttpStatus.CONFLICT));
                    }

                    return studentRecordRepository.findByEmail(email)
                            .defaultIfEmpty(new StudentRecord())
                            .flatMap(record -> {
                                PlacementApplication app = new PlacementApplication();
                                app.setJobId(jobId);
                                app.setStudentId(studentId);
                                app.setStudentEmail(email);
                                app.setStudentName(record.getFullName() != null ? record.getFullName() : request.getStudentName());
                                app.setStudentCgpa(record.getCgpa() != null ? record.getCgpa() : request.getStudentCgpa());
                                app.setStudentBranch(record.getBranch() != null ? record.getBranch() : request.getStudentBranch());
                                app.setStudentSkills(record.getSkills() != null ? record.getSkills() : request.getStudentSkills());
                                app.setResumeUrl(request.getResumeUrl());
                                app.setCustomAnswers(request.getCustomAnswers());
                                app.setStatus(PlacementApplication.ApplicationStatus.APPLIED);
                                app.setCurrentRound(0);
                                app.setRoundResults(new ArrayList<>());
                                app.setFitScore(Math.min(100, 60 + (int)(Math.random() * 40)));
                                app.setAppliedAt(Instant.now());
                                app.setUpdatedAt(Instant.now());
                                return applicationRepository.save(app)
                                        .flatMap(saved -> updateStudentStatusOnApply(saved).thenReturn(saved));
                            });
                });
    }

    // ✅ SAFE STATUS UPDATE ON APPLY
    private Mono<StudentPlacementStatus> updateStudentStatusOnApply(PlacementApplication app) {

        return statusRepository.findByStudentId(app.getStudentId())
                .defaultIfEmpty(new StudentPlacementStatus())
                .flatMap(status -> {

                    status.setStudentId(app.getStudentId());

                    int total = status.getTotalApplications() == null ? 0 : status.getTotalApplications();
                    status.setTotalApplications(total + 1);

                    List<String> active = status.getActiveApplications() == null
                            ? new ArrayList<>()
                            : new ArrayList<>(status.getActiveApplications());

                    active.add(app.getId());
                    status.setActiveApplications(active);

                    if (status.getCreatedAt() == null) {
                        status.setCreatedAt(Instant.now());
                    }

                    return statusRepository.save(status);
                });
    }

    // ✅ GET MY APPLICATIONS (JWT SAFE)
    public Flux<PlacementApplication> getMyApplications(String token) {

        String cleanToken = token.replace("Bearer ", "");

        if (!jwtUtil.isTokenValid(cleanToken)) {
            return Flux.error(new AppException("Invalid token", HttpStatus.UNAUTHORIZED));
        }

        String studentId = jwtUtil.extractUserId(cleanToken);

        return applicationRepository.findByStudentId(studentId);
    }

    // ✅ UPDATE STATUS
    public Mono<PlacementApplication> updateStatus(String applicationId, UpdateApplicationStatusRequest request) {

        return applicationRepository.findById(applicationId)
                .switchIfEmpty(Mono.error(new AppException("Application not found", HttpStatus.NOT_FOUND)))
                .flatMap(app -> {
                    PlacementApplication.ApplicationStatus previousStatus = app.getStatus();

                    if (request.getStatus() != null) {
                        try {
                            app.setStatus(PlacementApplication.ApplicationStatus.valueOf(request.getStatus()));
                        } catch (Exception e) {
                            return Mono.error(new AppException("Invalid status", HttpStatus.BAD_REQUEST));
                        }
                    }

                    if (request.getCurrentRound() != null) {
                        app.setCurrentRound(request.getCurrentRound());
                    }

                    if (request.getRoundResult() != null && !request.getRoundResult().isEmpty()) {
                        app.addRoundResult(request.getRoundResult());
                    }

                    app.setUpdatedAt(Instant.now());

                    return applicationRepository.save(app)
                            .flatMap(saved -> updateStudentStatusOnStatusChange(saved, previousStatus)
                                    .thenReturn(saved));
                });
    }

    // ✅ SAFE STATUS CHANGE HANDLER — updates all aggregate counters
    private Mono<StudentPlacementStatus> updateStudentStatusOnStatusChange(
            PlacementApplication app, PlacementApplication.ApplicationStatus previousStatus) {

        return statusRepository.findByStudentId(app.getStudentId())
                .defaultIfEmpty(new StudentPlacementStatus())
                .flatMap(status -> {
                    status.setStudentId(app.getStudentId());

                    List<String> active = status.getActiveApplications() == null
                            ? new ArrayList<>() : new ArrayList<>(status.getActiveApplications());

                    int shortlisted = status.getShortlistedCount() != null ? status.getShortlistedCount() : 0;
                    int interview   = status.getInterviewCount()   != null ? status.getInterviewCount()   : 0;
                    int offers      = status.getOffersReceived()   != null ? status.getOffersReceived()   : 0;
                    int rejected    = status.getRejectedCount()    != null ? status.getRejectedCount()    : 0;

                    switch (app.getStatus()) {
                        case SHORTLISTED -> status.setShortlistedCount(shortlisted + 1);
                        case INTERVIEW   -> status.setInterviewCount(interview + 1);
                        case OFFER       -> {
                            status.setOffersReceived(offers + 1);
                            status.setPlaced(true);
                            if (app.getStudentBranch() != null) status.setPlacedCompany(app.getStudentBranch());
                        }
                        case REJECTED    -> {
                            status.setRejectedCount(rejected + 1);
                            active.remove(app.getId());
                        }
                        case HOLD        -> status.setOnHold(true);
                        default          -> {}
                    }

                    status.setActiveApplications(active);
                    return statusRepository.save(status);
                });
    }

    // ✅ GET STUDENT DETAIL WITH FULL APPLICATION HISTORY
    public Mono<com.placement.placement.dto.response.StudentDetailResponse> getStudentDetail(String studentId) {
        Mono<StudentPlacementStatus> statusMono = statusRepository.findByStudentId(studentId)
                .defaultIfEmpty(new StudentPlacementStatus());

        Mono<List<com.placement.placement.dto.response.StudentDetailResponse.ApplicationSummary>> appsMono =
                applicationRepository.findByStudentIdOrderByAppliedAtDesc(studentId)
                        .map(com.placement.placement.dto.response.StudentDetailResponse.ApplicationSummary::from)
                        .collectList();

        // Pull student name/email/cgpa/branch from the first application record
        Mono<PlacementApplication> firstAppMono = applicationRepository
                .findByStudentId(studentId).next().defaultIfEmpty(new PlacementApplication());

        return Mono.zip(statusMono, appsMono, firstAppMono)
                .map(tuple -> {
                    StudentPlacementStatus status = tuple.getT1();
                    if (status.getStudentId() == null) status.setStudentId(studentId);
                    PlacementApplication first = tuple.getT3();
                    return com.placement.placement.dto.response.StudentDetailResponse.from(
                            status,
                            tuple.getT2(),
                            first.getStudentName(),
                            first.getStudentEmail(),
                            first.getStudentCgpa(),
                            first.getStudentBranch());
                });
    }

    public Mono<Void> revokeApplication(String applicationId) {
        return applicationRepository.findById(applicationId)
                .switchIfEmpty(Mono.error(new AppException("Application not found", HttpStatus.NOT_FOUND)))
                .flatMap(app -> applicationRepository.deleteById(app.getId()));
    }

    // Fetch applicants for a drive — resolves drive's jobId first, then queries applications
    public Flux<PlacementApplication> getApplicantsForDrive(String driveId) {
        return driveRepository.findById(driveId)
                .flatMapMany(drive -> {
                    String jobId = drive.getJobId() != null ? drive.getJobId() : driveId;
                    return applicationRepository.findByJobId(jobId);
                })
                .switchIfEmpty(applicationRepository.findByJobId(driveId));
    }

    public Flux<PlacementApplication> getApplicantsForJob(String jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Mono<PlacementDrive> createDrive(CreateDriveRequest request) {
        PlacementDrive drive = new PlacementDrive();
        drive.setCompany(request.getCompany());
        drive.setJobId(request.getJobId());
        drive.setTpoId(request.getTpoId());
        drive.setCollegeId(request.getCollegeId());

        PlacementDrive.EligibilityRules rules = new PlacementDrive.EligibilityRules();
        rules.setMinCgpa(request.getMinCgpa());
        rules.setBranches(request.getBranches());
        rules.setGraduationYear(request.getGraduationYear());
        rules.setMaxBacklogs(request.getMaxBacklogs());

        drive.setEligibilityRules(rules);
        drive.setRounds(request.getRounds());
        drive.setCurrentRound(0);
        drive.setStatus(PlacementDrive.DriveStatus.UPCOMING);
        drive.setRegisteredStudents(new ArrayList<>());
        drive.setPlacedStudents(new ArrayList<>());
        drive.setCreatedAt(Instant.now());
        drive.setDeadline(request.getDeadline());

        return driveRepository.save(drive);
    }

    public Flux<PlacementDrive> getDrives() {
        return driveRepository.findAll();
    }

    public Mono<StudentPlacementStatus> holdStudent(String studentId, HoldStudentRequest request) {
        return statusRepository.findByStudentId(studentId)
                .defaultIfEmpty(new StudentPlacementStatus())
                .flatMap(status -> {
                    status.setStudentId(studentId);
                    status.setOnHold(request.isOnHold());
                    status.setHoldReason(request.getHoldReason());

                    if (status.getCreatedAt() == null) {
                        status.setCreatedAt(Instant.now());
                    }

                    return statusRepository.save(status);
                });
    }

    public Mono<StudentPlacementStatus> placeStudent(String studentId, PlaceStudentRequest request) {
        return statusRepository.findByStudentId(studentId)
                .defaultIfEmpty(new StudentPlacementStatus())
                .flatMap(status -> {
                    status.setStudentId(studentId);
                    status.setPlaced(true);
                    status.setPlacedCompany(request.getPlacedCompany());
                    status.setPlacedCtc(request.getPlacedCtc());
                    status.setOnHold(false);

                    if (status.getCreatedAt() == null) {
                        status.setCreatedAt(Instant.now());
                    }

                    return statusRepository.save(status);
                });
    }

    public Mono<StatsResponse> getStats() {
        return Mono.zip(
                applicationRepository.count(),
                applicationRepository.countByStatus(PlacementApplication.ApplicationStatus.OFFER),
                applicationRepository.countByStatus(PlacementApplication.ApplicationStatus.SHORTLISTED),
                applicationRepository.countByStatus(PlacementApplication.ApplicationStatus.INTERVIEW),
                applicationRepository.countByStatus(PlacementApplication.ApplicationStatus.REJECTED),
                driveRepository.countByStatus(PlacementDrive.DriveStatus.ACTIVE),
                driveRepository.countByStatus(PlacementDrive.DriveStatus.UPCOMING)
        ).flatMap(tuple ->
            Mono.zip(
                driveRepository.count(),
                statusRepository.countByPlaced(true),
                statusRepository.countByOnHold(true),
                getAtRiskStudents().count()
            ).map(tuple2 -> {
                StatsResponse stats = new StatsResponse();
                stats.setTotalApplications(tuple.getT1());
                stats.setOffersMade(tuple.getT2());
                stats.setShortlistedStudents(tuple.getT3());
                stats.setInterviewStudents(tuple.getT4());
                stats.setRejectedStudents(tuple.getT5());
                stats.setActiveDrives(tuple.getT6());
                stats.setUpcomingDrives(tuple.getT7());
                stats.setTotalDrives(tuple2.getT1());
                stats.setPlacedStudents(tuple2.getT2());
                stats.setOnHoldStudents(tuple2.getT3());
                stats.setAtRiskStudents(tuple2.getT4());
                return stats;
            })
        );
    }

    public Flux<StudentPlacementStatus> getAtRiskStudents() {
        return statusRepository.findByPlacedFalse()
                .filter(s -> s.isOnHold() || (s.getOffersReceived() == null || s.getOffersReceived() == 0));
    }

    // ✅ GET STUDENT'S OWN RECORD BY EMAIL
    public Mono<StudentRecord> getMyRecord(String token) {
        String clean = token.replace("Bearer ", "");
        if (!jwtUtil.isTokenValid(clean))
            return Mono.error(new AppException("Invalid token", HttpStatus.UNAUTHORIZED));
        String email = jwtUtil.extractEmail(clean);
        return studentRecordRepository.findByEmail(email)
                .switchIfEmpty(Mono.error(new AppException("Record not found", HttpStatus.NOT_FOUND)));
    }

    // ✅ UPDATE STUDENT READINESS / STATUS
    public Mono<StudentRecord> updateStudent(String id, StudentCreateRequest request) {
        return studentRecordRepository.findById(id)
                .switchIfEmpty(Mono.error(new AppException("Student not found", HttpStatus.NOT_FOUND)))
                .flatMap(record -> {
                    if (request.getReadiness() != null) record.setReadiness(request.getReadiness());
                    if (request.getStatus() != null) record.setStatus(request.getStatus());
                    if (request.getSkills() != null) record.setSkills(request.getSkills());
                    if (request.getCgpa() != null) record.setCgpa(request.getCgpa());
                    return studentRecordRepository.save(record);
                });
    }

    // ✅ DELETE STUDENT
    public Mono<Void> deleteStudent(String id) {
        return studentRecordRepository.findById(id)
                .switchIfEmpty(Mono.error(new AppException("Student not found", HttpStatus.NOT_FOUND)))
                .flatMap(record -> studentRecordRepository.deleteById(record.getId()));
    }

    // 🆕 STUDENTS CRUD FOR TPO
    public Flux<StudentRecord> getStudents() {
        return studentRecordRepository.findAll();
    }

    public Mono<StudentRecord> createStudent(StudentCreateRequest request, String source) {
        StudentRecord record = new StudentRecord();
        record.setFullName(request.getFullName());
        record.setEmail(request.getEmail());
        record.setRollNumber(request.getRollNumber());
        record.setBranch(request.getBranch());
        record.setCgpa(request.getCgpa());
        record.setGraduationYear(request.getGraduationYear());
        record.setPhone(request.getPhone());
        record.setSkills(request.getSkills());
        record.setStatus("in-process");
        record.setReadiness(40);
        record.setSource(source);
        record.setCreatedAt(Instant.now());

        return studentRecordRepository.existsByRollNumber(record.getRollNumber())
                .flatMap(exists -> {
                    if (Boolean.TRUE.equals(exists)) {
                        return Mono.error(new AppException("Roll number already exists", HttpStatus.CONFLICT));
                    }
                    return studentRecordRepository.save(record)
                            .flatMap(saved -> ensureStatusRecord(saved.getRollNumber()).thenReturn(saved));
                });
    }

    public Mono<List<StudentRecord>> importStudents(List<StudentCreateRequest> requests, String source) {
        List<StudentRecord> records = requests.stream().map(req -> {
            StudentRecord r = new StudentRecord();
            r.setFullName(req.getFullName());
            r.setEmail(req.getEmail());
            r.setRollNumber(req.getRollNumber());
            r.setBranch(req.getBranch());
            r.setCgpa(req.getCgpa());
            r.setGraduationYear(req.getGraduationYear());
            r.setPhone(req.getPhone());
            r.setSkills(req.getSkills());
            r.setStatus("in-process");
            r.setReadiness(40);
            r.setSource(source);
            r.setCreatedAt(Instant.now());
            return r;
        }).collect(Collectors.toList());

        return studentRecordRepository.saveAll(records)
                .flatMap(saved -> ensureStatusRecord(saved.getRollNumber()).thenReturn(saved))
                .collectList();
    }

    public Mono<List<StudentRecord>> importFromExcel(FilePart file) {
        return DataBufferUtils.join(file.content())
                .flatMap(buffer -> {
                    try (InputStream in = buffer.asInputStream(true);
                         Workbook workbook = new XSSFWorkbook(in)) {
                        List<StudentCreateRequest> rows = parseExcel(workbook);
                        return importStudents(rows, "excel");
                    } catch (IOException e) {
                        return Mono.error(new AppException("Invalid Excel file", HttpStatus.BAD_REQUEST));
                    } finally {
                        DataBufferUtils.release(buffer);
                    }
                });
    }

    private List<StudentCreateRequest> parseExcel(Workbook workbook) {
        List<StudentCreateRequest> rows = new ArrayList<>();
        Sheet sheet = workbook.getSheetAt(0);
        for (Row row : sheet) {
            if (row.getRowNum() == 0) continue; // header
            if (row.getCell(0) == null || row.getCell(0).toString().isBlank()) continue;

            StudentCreateRequest req = new StudentCreateRequest();
            req.setFullName(getString(row, 0));
            req.setEmail(getString(row, 1));
            req.setRollNumber(getString(row, 2));
            req.setBranch(getString(row, 3));
            req.setCgpa(getDouble(row, 4));
            double grad = getDouble(row, 5);
            if (grad > 0) req.setGraduationYear((int) grad);
            req.setPhone(getString(row, 6));
            String skills = getString(row, 7);
            if (skills != null) {
                req.setSkills(List.of(skills.split(",")));
            }
            rows.add(req);
        }
        return rows;
    }

    private String getString(Row row, int idx) {
        return row.getCell(idx) != null ? row.getCell(idx).toString().trim() : null;
    }

    private double getDouble(Row row, int idx) {
        if (row.getCell(idx) == null) return 0.0;
        try {
            return row.getCell(idx).getNumericCellValue();
        } catch (IllegalStateException ex) {
            try {
                return Double.parseDouble(row.getCell(idx).getStringCellValue());
            } catch (Exception e) {
                return 0.0;
            }
        }
    }

    private Mono<StudentPlacementStatus> ensureStatusRecord(String studentId) {
        return statusRepository.findByStudentId(studentId)
                .switchIfEmpty(Mono.defer(() -> {
                    StudentPlacementStatus s = new StudentPlacementStatus();
                    s.setStudentId(studentId);
                    s.setPlaced(false);
                    s.setOnHold(false);
                    s.setOffersReceived(0);
                    s.setActiveApplications(new ArrayList<>());
                    s.setCreatedAt(Instant.now());
                    return statusRepository.save(s);
                }));
    }
}
