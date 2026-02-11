package com.krishisetu.backend.service;

import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.entity.Machinery;
import com.krishisetu.backend.repository.UserRepository;
import com.krishisetu.backend.repository.MachineryRepository;
import com.krishisetu.backend.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MachineryOwnerSubAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MachineryRepository machineryRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    /**
     * Register a new machinery owner
     * 
     * @param owner User object representing a machinery owner
     * @return Created owner user
     */
    public User registerMachineryOwner(User owner) {
        if (userRepository.existsByEmail(owner.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        owner.setRole("MACHINERY_OWNER");
        owner.setEnabled(true);
        owner.setApproved(false); // Requires sub-admin approval
        return userRepository.save(owner);
    }

    /**
     * Get all pending machinery owner registrations
     * 
     * @return List of unapproved machinery owners
     */
    public List<User> getPendingOwnerRegistrations() {
        return userRepository.findByRoleAndApprovedFalse("MACHINERY_OWNER");
    }

    /**
     * Approve a machinery owner registration
     * 
     * @param ownerId ID of the machinery owner to approve
     */
    public void approveOwnerRegistration(Long ownerId) {
        var owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Machinery owner not found"));

        if (!isValidOwnerRole(owner.getRole())) {
            throw new IllegalArgumentException("User is not a machinery owner");
        }

        owner.setApproved(true);
        userRepository.save(owner);
    }

    /**
     * Reject a machinery owner registration
     * 
     * @param ownerId ID of the machinery owner to reject
     */
    public void rejectOwnerRegistration(Long ownerId) {
        var owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Machinery owner not found"));

        if (!isValidOwnerRole(owner.getRole())) {
            throw new IllegalArgumentException("User is not a machinery owner");
        }

        // Delete associated OTP verification if exists
        otpVerificationRepository.findByUser(owner).ifPresent(otp -> {
            otpVerificationRepository.delete(otp);
        });

        userRepository.deleteById(ownerId);
    }

    /**
     * Get all pending machinery listings for approval
     * 
     * @return List of unapproved machinery items
     */
    public List<Machinery> getPendingMachineryListings() {
        return machineryRepository.findByApprovedFalse();
    }

    /**
     * Approve machinery listing
     * 
     * @param machineryId ID of the machinery to approve
     */
    public void approveMachinery(Long machineryId) {
        var machinery = machineryRepository.findById(machineryId)
                .orElseThrow(() -> new RuntimeException("Machinery not found"));

        machinery.setApproved(true);
        machineryRepository.save(machinery);
    }

    /**
     * Reject machinery listing
     * 
     * @param machineryId ID of the machinery to reject
     */
    public void rejectMachinery(Long machineryId) {
        if (!machineryRepository.existsById(machineryId)) {
            throw new RuntimeException("Machinery not found");
        }
        machineryRepository.deleteById(machineryId);
    }

    /**
     * Get all approved machinery owners
     * 
     * @return List of approved machinery owners
     */
    public List<User> getAllApprovedOwners() {
        return userRepository.findByRoleAndApprovedTrue("MACHINERY_OWNER");
    }

    /**
     * Get machinery owner details
     * 
     * @param ownerId ID of the machinery owner
     * @return Owner user object
     */
    public User getOwnerDetails(Long ownerId) {
        var owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Machinery owner not found"));

        if (!isValidOwnerRole(owner.getRole())) {
            throw new IllegalArgumentException("User is not a machinery owner");
        }

        return owner;
    }

    /**
     * Disable a machinery owner account
     * 
     * @param ownerId ID of the owner
     */
    public void disableOwner(Long ownerId) {
        var owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Machinery owner not found"));

        owner.setEnabled(false);
        userRepository.save(owner);
    }

    /**
     * Enable a machinery owner account
     * 
     * @param ownerId ID of the owner
     */
    public void enableOwner(Long ownerId) {
        var owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Machinery owner not found"));

        owner.setEnabled(true);
        userRepository.save(owner);
    }

    private boolean isValidOwnerRole(String role) {
        return role != null && (role.equalsIgnoreCase("MACHINERY_OWNER") ||
                role.equalsIgnoreCase("ROLE_MACHINERY_OWNER") ||
                role.equalsIgnoreCase("ROLE_OWNER"));
    }
}
