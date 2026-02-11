package com.krishisetu.backend.service;

import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.repository.UserRepository;
import com.krishisetu.backend.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkerSubAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    /**
     * Register a new worker
     * 
     * @param worker User object representing a worker
     * @return Created worker user
     */
    public User registerWorker(User worker) {
        if (userRepository.existsByEmail(worker.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        worker.setRole("WORKER");
        worker.setEnabled(true);
        worker.setApproved(false); // Requires sub-admin approval
        return userRepository.save(worker);
    }

    /**
     * Get all pending worker registrations
     * 
     * @return List of unapproved workers
     */
    public List<User> getPendingWorkerRegistrations() {
        return userRepository.findByRoleAndApprovedFalse("WORKER");
    }

    /**
     * Approve a worker registration
     * 
     * @param workerId ID of the worker to approve
     */
    public void approveWorkerRegistration(Long workerId) {
        var worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        if (!isValidWorkerRole(worker.getRole())) {
            throw new IllegalArgumentException("User is not a worker");
        }

        worker.setApproved(true);
        userRepository.save(worker);
    }

    /**
     * Reject a worker registration
     * 
     * @param workerId ID of the worker to reject
     */
    public void rejectWorkerRegistration(Long workerId) {
        var worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        if (!isValidWorkerRole(worker.getRole())) {
            throw new IllegalArgumentException("User is not a worker");
        }

        // Delete associated OTP verification if exists
        otpVerificationRepository.findByUser(worker).ifPresent(otp -> {
            otpVerificationRepository.delete(otp);
        });

        userRepository.deleteById(workerId);
    }

    /**
     * Get all approved workers
     * 
     * @return List of approved workers
     */
    public List<User> getAllApprovedWorkers() {
        return userRepository.findByRoleAndApprovedTrue("WORKER");
    }

    /**
     * Get worker details
     * 
     * @param workerId ID of the worker
     * @return Worker user object
     */
    public User getWorkerDetails(Long workerId) {
        var worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        if (!isValidWorkerRole(worker.getRole())) {
            throw new IllegalArgumentException("User is not a worker");
        }

        return worker;
    }

    /**
     * Disable a worker account
     * 
     * @param workerId ID of the worker
     */
    public void disableWorker(Long workerId) {
        var worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        worker.setEnabled(false);
        userRepository.save(worker);
    }

    /**
     * Enable a worker account
     * 
     * @param workerId ID of the worker
     */
    public void enableWorker(Long workerId) {
        var worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        worker.setEnabled(true);
        userRepository.save(worker);
    }

    /**
     * Verify worker credentials/documents
     * 
     * @param workerId ID of the worker
     */
    public void verifyWorkerDocuments(Long workerId) {
        var worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        // Mark as verified
        worker.setApproved(true);
        userRepository.save(worker);
    }

    private boolean isValidWorkerRole(String role) {
        return role != null && (role.equalsIgnoreCase("WORKER") || role.equalsIgnoreCase("ROLE_WORKER")
                || role.equalsIgnoreCase("FarmWorker"));
    }
}
