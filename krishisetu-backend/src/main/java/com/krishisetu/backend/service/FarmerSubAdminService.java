package com.krishisetu.backend.service;

import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.repository.UserRepository;
import com.krishisetu.backend.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FarmerSubAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    /**
     * Register a new farmer
     * 
     * @param farmer User object representing a farmer
     * @return Created farmer user
     */
    public User registerFarmer(User farmer) {
        if (userRepository.existsByEmail(farmer.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        farmer.setRole("FARMER");
        farmer.setEnabled(true);
        farmer.setApproved(false); // Requires sub-admin approval
        return userRepository.save(farmer);
    }

    /**
     * Get all pending farmer registrations
     * 
     * @return List of unapproved farmers
     */
    public List<User> getPendingFarmerRegistrations() {
        // This would need a custom query in UserRepository
        return userRepository.findByRoleAndApprovedFalse("FARMER");
    }

    /**
     * Approve a farmer registration
     * 
     * @param farmerId ID of the farmer to approve
     */
    public void approveFarmerRegistration(Long farmerId) {
        var farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        if (!isValidFarmerRole(farmer.getRole())) {
            throw new IllegalArgumentException("User is not a farmer");
        }

        farmer.setApproved(true);
        userRepository.save(farmer);
    }

    /**
     * Reject a farmer registration
     * 
     * @param farmerId ID of the farmer to reject
     */
    public void rejectFarmerRegistration(Long farmerId) {
        var farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        if (!isValidFarmerRole(farmer.getRole())) {
            throw new IllegalArgumentException("User is not a farmer");
        }

        // Delete associated OTP verification if exists
        otpVerificationRepository.findByUser(farmer).ifPresent(otp -> {
            otpVerificationRepository.delete(otp);
        });

        userRepository.deleteById(farmerId);
    }

    /**
     * Get all approved farmers
     * 
     * @return List of approved farmers
     */
    public List<User> getAllApprovedFarmers() {
        return userRepository.findByRoleAndApprovedTrue("FARMER");
    }

    /**
     * Get farmer details
     * 
     * @param farmerId ID of the farmer
     * @return Farmer user object
     */
    public User getFarmerDetails(Long farmerId) {
        var farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        if (!isValidFarmerRole(farmer.getRole())) {
            throw new IllegalArgumentException("User is not a farmer");
        }

        return farmer;
    }

    /**
     * Disable a farmer account
     * 
     * @param farmerId ID of the farmer
     */
    public void disableFarmer(Long farmerId) {
        var farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        farmer.setEnabled(false);
        userRepository.save(farmer);
    }

    /**
     * Enable a farmer account
     * 
     * @param farmerId ID of the farmer
     */
    public void enableFarmer(Long farmerId) {
        var farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        farmer.setEnabled(true);
        userRepository.save(farmer);
    }

    private boolean isValidFarmerRole(String role) {
        return role != null && (role.equalsIgnoreCase("FARMER") || role.equalsIgnoreCase("ROLE_FARMER"));
    }
}
