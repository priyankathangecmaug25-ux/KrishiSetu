package com.krishisetu.backend.controller;

import com.krishisetu.backend.dto.MessageResponse;
import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.service.WorkerSubAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subadmin/worker")
public class WorkerSubAdminController {

    @Autowired
    private WorkerSubAdminService workerSubAdminService;

    /**
     * Register a new worker
     * POST /api/subadmin/worker/register
     * 
     * @param worker Worker user details
     * @return Registered worker
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> registerWorker(@RequestBody User worker) {
        try {
            User registeredWorker = workerSubAdminService.registerWorker(worker);
            return ResponseEntity.ok(Map.of(
                    "message", "Worker registered successfully",
                    "worker", registeredWorker));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all pending worker registrations
     * GET /api/subadmin/worker/pending
     * 
     * @return List of pending worker registrations
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> getPendingRegistrations() {
        List<User> pendingWorkers = workerSubAdminService.getPendingWorkerRegistrations();
        return ResponseEntity.ok(pendingWorkers);
    }

    /**
     * Approve a worker registration
     * PUT /api/subadmin/worker/{id}/approve
     * 
     * @param workerId ID of the worker to approve
     * @return Success message
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> approveWorker(@PathVariable("id") Long workerId) {
        try {
            workerSubAdminService.approveWorkerRegistration(workerId);
            return ResponseEntity.ok(new MessageResponse("Worker registration approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reject a worker registration
     * PUT /api/subadmin/worker/{id}/reject
     * 
     * @param workerId ID of the worker to reject
     * @return Success message
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> rejectWorker(@PathVariable("id") Long workerId) {
        try {
            workerSubAdminService.rejectWorkerRegistration(workerId);
            return ResponseEntity.ok(new MessageResponse("Worker registration rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all approved workers
     * GET /api/subadmin/worker/approved
     * 
     * @return List of approved workers
     */
    @GetMapping("/approved")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> getApprovedWorkers() {
        List<User> approvedWorkers = workerSubAdminService.getAllApprovedWorkers();
        return ResponseEntity.ok(approvedWorkers);
    }

    /**
     * Get worker details
     * GET /api/subadmin/worker/{id}
     * 
     * @param workerId ID of the worker
     * @return Worker details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> getWorkerDetails(@PathVariable("id") Long workerId) {
        try {
            User worker = workerSubAdminService.getWorkerDetails(workerId);
            return ResponseEntity.ok(worker);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Verify worker documents
     * PUT /api/subadmin/worker/{id}/verify
     * 
     * @param workerId ID of the worker
     * @return Success message
     */
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> verifyWorkerDocuments(@PathVariable("id") Long workerId) {
        try {
            workerSubAdminService.verifyWorkerDocuments(workerId);
            return ResponseEntity.ok(new MessageResponse("Worker documents verified"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Disable a worker account
     * PUT /api/subadmin/worker/{id}/disable
     * 
     * @param workerId ID of the worker
     * @return Success message
     */
    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> disableWorker(@PathVariable("id") Long workerId) {
        try {
            workerSubAdminService.disableWorker(workerId);
            return ResponseEntity.ok(new MessageResponse("Worker disabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Enable a worker account
     * PUT /api/subadmin/worker/{id}/enable
     * 
     * @param workerId ID of the worker
     * @return Success message
     */
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> enableWorker(@PathVariable("id") Long workerId) {
        try {
            workerSubAdminService.enableWorker(workerId);
            return ResponseEntity.ok(new MessageResponse("Worker enabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get statistics for worker domain
     * GET /api/subadmin/worker/stats
     * 
     * @return Statistics map
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('WORKER_SUBADMIN')")
    public ResponseEntity<?> getStats() {
        List<User> pending = workerSubAdminService.getPendingWorkerRegistrations();
        List<User> approved = workerSubAdminService.getAllApprovedWorkers();

        return ResponseEntity.ok(Map.of(
                "pendingRegistrations", pending.size(),
                "approvedWorkers", approved.size(),
                "totalWorkers", pending.size() + approved.size()));
    }
}
