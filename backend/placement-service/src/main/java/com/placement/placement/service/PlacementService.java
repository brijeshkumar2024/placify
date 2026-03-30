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
                            .flatMap(saved -> updateStudentStatusOnStatusChange(saved).thenReturn(saved));
                });
    }

    // ✅ SAFE STATUS CHANGE HANDLER
    private Mono<StudentPlacementStatus> updateStudentStatusOnStatusChange(PlacementApplication app) {

        return statusRepository.findByStudentId(app.getStudentId())
                .defaultIfEmpty(new StudentPlacementStatus())
                .flatMap(status -> {

                    status.setStudentId(app.getStudentId());

                    List<String> active = status.getActiveApplications() == null
                            ? new ArrayList<>()
                            : new ArrayList<>(status.getActiveApplications());

                    if (app.getStatus() == PlacementApplication.ApplicationStatus.REJECTED) {
                        active.remove(app.getId());
                    }

                    if (app.getStatus() == PlacementApplication.ApplicationStatus.OFFER) {
                        int offers = status.getOffersReceived() == null ? 0 : status.getOffersReceived();
                        status.setOffersReceived(offers + 1);
                    }

                    status.setActiveApplications(active);

                    return statusRepository.save(status);
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
                driveRepository.countByStatus(PlacementDrive.DriveStatus.ACTIVE),
                driveRepository.countByStatus(PlacementDrive.DriveStatus.UPCOMING),
                driveRepository.count(),
                statusRepository.countByPlaced(true),
                statusRepository.countByOnHold(true)
        ).flatMap(tuple -> getAtRiskStudents().count().map(atRisk -> {
            StatsResponse stats = new StatsResponse();
            stats.setTotalApplications(tuple.getT1());
            stats.setOffersMade(tuple.getT2());
            stats.setActiveDrives(tuple.getT3());
            stats.setUpcomingDrives(tuple.getT4());
            stats.setTotalDrives(tuple.getT5());
            stats.setPlacedStudents(tuple.getT6());
            stats.setOnHoldStudents(tuple.getT7());
            stats.setAtRiskStudents(atRisk);
            return stats;
        }));
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
