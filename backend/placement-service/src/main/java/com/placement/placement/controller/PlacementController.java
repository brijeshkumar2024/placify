package com.placement.placement.controller;

import com.placement.placement.dto.request.ApplyPlacementRequest;
import com.placement.placement.dto.request.CreateDriveRequest;
import com.placement.placement.dto.request.HoldStudentRequest;
import com.placement.placement.dto.request.PlaceStudentRequest;
import com.placement.placement.dto.request.StudentCreateRequest;
import com.placement.placement.dto.request.StudentImportRequest;
import com.placement.placement.dto.request.UpdateApplicationStatusRequest;
import com.placement.placement.dto.response.ApiResponse;
import com.placement.placement.dto.response.StatsResponse;
import com.placement.placement.service.PlacementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/placement")
public class PlacementController {

    private static final Logger log = LoggerFactory.getLogger(PlacementController.class);
    private final PlacementService placementService;

    public PlacementController(PlacementService placementService) {
        this.placementService = placementService;
    }

    // Internal sync endpoint called by job-service when recruiter updates status
    @PostMapping("/internal/sync-status")
    public Mono<ResponseEntity<ApiResponse<Object>>> syncStatus(
            @RequestBody java.util.Map<String, String> payload) {
        String studentId = payload.get("studentId");
        String status    = payload.get("status");
        String company   = payload.get("company");
        log.info("[SyncEndpoint] Received sync | studentId={} status={} company={}", studentId, status, company);
        return placementService.syncStudentStatus(studentId, status, company)
                .doOnSuccess(v -> log.info("[SyncEndpoint] ✅ StudentPlacementStatus updated | studentId={} status={}", studentId, status))
                .doOnError(ex -> log.error("[SyncEndpoint] ❌ Sync failed | studentId={} status={} | error={}", studentId, status, ex.getMessage()))
                .then(Mono.just(ResponseEntity.ok(ApiResponse.success("Synced.", (Object) null))))
                .onErrorResume(ex -> Mono.just(ResponseEntity.ok(ApiResponse.success("Sync skipped: " + ex.getMessage(), (Object) null))));
    }

    @GetMapping("/health")
    public Mono<ResponseEntity<ApiResponse<String>>> health() {
        return Mono.just(ResponseEntity.ok(ApiResponse.success("Placement service is running.", null)));
    }

    @PostMapping("/apply/{jobId}")
    public Mono<ResponseEntity<ApiResponse<Object>>> apply(
            @RequestHeader("Authorization") String token,
            @PathVariable String jobId,
            @RequestBody ApplyPlacementRequest request) {
        return placementService.apply(token, jobId, request)
                .map(app -> ResponseEntity.ok(ApiResponse.success("Application submitted.", (Object) app)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @GetMapping("/my-applications")
    public Mono<ResponseEntity<ApiResponse<Object>>> myApplications(
            @RequestHeader("Authorization") String token) {
        return placementService.getMyApplications(token)
                .collectList()
                .map(apps -> ResponseEntity.ok(ApiResponse.success("Applications fetched.", (Object) apps)));
    }

    @PutMapping("/applications/{id}/status")
    public Mono<ResponseEntity<ApiResponse<Object>>> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateApplicationStatusRequest request) {
        return placementService.updateStatus(id, request)
                .map(app -> ResponseEntity.ok(ApiResponse.success("Status updated.", (Object) app)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public Mono<ResponseEntity<ApiResponse<Object>>> applicants(@PathVariable String jobId) {
        return placementService.getApplicantsForJob(jobId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("Applicants fetched.", (Object) list)));
    }

    @GetMapping("/drives/{driveId}/applicants")
    public Mono<ResponseEntity<ApiResponse<Object>>> driveApplicants(@PathVariable String driveId) {
        return placementService.getApplicantsForDrive(driveId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("Applicants fetched.", (Object) list)));
    }

    @DeleteMapping("/applications/{id}")
    public Mono<ResponseEntity<ApiResponse<Object>>> revokeApplication(@PathVariable String id) {
        return placementService.revokeApplication(id)
                .map(v -> ResponseEntity.ok(ApiResponse.success("Application revoked.", (Object) null)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @PostMapping("/drives")
    public Mono<ResponseEntity<ApiResponse<Object>>> createDrive(@RequestBody CreateDriveRequest request) {
        return placementService.createDrive(request)
                .map(drive -> ResponseEntity.ok(ApiResponse.success("Drive created.", (Object) drive)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @GetMapping("/drives")
    public Mono<ResponseEntity<ApiResponse<Object>>> getDrives() {
        return placementService.getDrives()
                .collectList()
                .map(drives -> ResponseEntity.ok(ApiResponse.success("Drives fetched.", (Object) drives)));
    }

    @PutMapping("/students/{id}/hold")
    public Mono<ResponseEntity<ApiResponse<Object>>> holdStudent(
            @PathVariable String id,
            @RequestBody HoldStudentRequest request) {
        return placementService.holdStudent(id, request)
                .map(status -> ResponseEntity.ok(ApiResponse.success("Student hold updated.", (Object) status)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @PutMapping("/students/{id}/place")
    public Mono<ResponseEntity<ApiResponse<Object>>> placeStudent(
            @PathVariable String id,
            @RequestBody PlaceStudentRequest request) {
        return placementService.placeStudent(id, request)
                .map(status -> ResponseEntity.ok(ApiResponse.success("Student marked placed.", (Object) status)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @GetMapping("/stats")
    public Mono<ResponseEntity<ApiResponse<StatsResponse>>> stats() {
        return placementService.getStats()
                .map(stats -> ResponseEntity.ok(ApiResponse.success("Stats fetched.", stats)));
    }

    @GetMapping("/at-risk")
    public Mono<ResponseEntity<ApiResponse<Object>>> atRisk() {
        return placementService.getAtRiskStudents()
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("At-risk students fetched.", (Object) list)));
    }

    // 🆕 Students management (TPO)
    @GetMapping("/students")
    public Mono<ResponseEntity<ApiResponse<Object>>> students() {
        return placementService.getStudents()
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success("Students fetched.", (Object) list)));
    }

    @PostMapping("/students")
    public Mono<ResponseEntity<ApiResponse<Object>>> createStudent(@RequestBody StudentCreateRequest request) {
        return placementService.createStudent(request, "manual")
                .map(saved -> ResponseEntity.ok(ApiResponse.success("Student added.", (Object) saved)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @PostMapping("/students/import")
    public Mono<ResponseEntity<ApiResponse<Object>>> importStudents(@RequestBody StudentImportRequest request) {
        return placementService.importStudents(request.getStudents(), "import")
                .map(saved -> ResponseEntity.ok(ApiResponse.success("Students imported.", (Object) saved)));
    }

    @GetMapping("/students/{id}")
    public Mono<ResponseEntity<ApiResponse<Object>>> studentDetail(@PathVariable String id) {
        return placementService.getStudentDetail(id)
                .map(detail -> ResponseEntity.ok(ApiResponse.success("Student detail fetched.", (Object) detail)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @DeleteMapping("/students/{id}")
    public Mono<ResponseEntity<ApiResponse<Object>>> deleteStudent(@PathVariable String id) {
        return placementService.deleteStudent(id)
                .then(Mono.just(ResponseEntity.ok(ApiResponse.success("Student removed.", (Object) null))))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @PatchMapping("/students/{id}")
    public Mono<ResponseEntity<ApiResponse<Object>>> updateStudent(
            @PathVariable String id,
            @RequestBody StudentCreateRequest request) {
        return placementService.updateStudent(id, request)
                .map(saved -> ResponseEntity.ok(ApiResponse.success("Student updated.", (Object) saved)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }

    @PostMapping("/students/import/excel")
    public Mono<ResponseEntity<ApiResponse<Object>>> importStudentsFromExcel(@RequestPart("file") FilePart file) {
        return placementService.importFromExcel(file)
                .map(saved -> ResponseEntity.ok(ApiResponse.success("Excel imported.", (Object) saved)))
                .onErrorResume(ex -> Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()))));
    }
}
