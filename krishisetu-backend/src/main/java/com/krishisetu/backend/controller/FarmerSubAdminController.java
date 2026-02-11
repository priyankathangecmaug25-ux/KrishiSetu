package com.krishisetu.backend.controller;

import com.krishisetu.backend.dto.MessageResponse;
import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.service.FarmerSubAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subadmin/farmer")
public class FarmerSubAdminController {

    @Autowired
    private FarmerSubAdminService farmerSubAdminService;

    /**
     * Register a new farmer
     * POST /api/subadmin/farmer/register
     * 
     * @param farmer Farmer user details
     * @return Registered farmer
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> registerFarmer(@RequestBody User farmer) {
        try {
            User registeredFarmer = farmerSubAdminService.registerFarmer(farmer);
            return ResponseEntity.ok(Map.of(
                    "message", "Farmer registered successfully",
                    "farmer", registeredFarmer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all pending farmer registrations
     * GET /api/subadmin/farmer/pending
     * 
     * @return List of pending farmer registrations
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> getPendingRegistrations() {
        List<User> pendingFarmers = farmerSubAdminService.getPendingFarmerRegistrations();
        return ResponseEntity.ok(pendingFarmers);
    }

    /**
     * Approve a farmer registration
     * PUT /api/subadmin/farmer/{id}/approve
     * 
     * @param farmerId ID of the farmer to approve
     * @return Success message
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> approveFarmer(@PathVariable("id") Long farmerId) {
        try {
            farmerSubAdminService.approveFarmerRegistration(farmerId);
            return ResponseEntity.ok(new MessageResponse("Farmer registration approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reject a farmer registration
     * PUT /api/subadmin/farmer/{id}/reject
     * 
     * @param farmerId ID of the farmer to reject
     * @return Success message
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> rejectFarmer(@PathVariable("id") Long farmerId) {
        try {
            farmerSubAdminService.rejectFarmerRegistration(farmerId);
            return ResponseEntity.ok(new MessageResponse("Farmer registration rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all approved farmers
     * GET /api/subadmin/farmer/approved
     * 
     * @return List of approved farmers
     */
    @GetMapping("/approved")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> getApprovedFarmers() {
        List<User> approvedFarmers = farmerSubAdminService.getAllApprovedFarmers();
        return ResponseEntity.ok(approvedFarmers);
    }

    /**
     * Get farmer details
     * GET /api/subadmin/farmer/{id}
     * 
     * @param farmerId ID of the farmer
     * @return Farmer details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> getFarmerDetails(@PathVariable("id") Long farmerId) {
        try {
            User farmer = farmerSubAdminService.getFarmerDetails(farmerId);
            return ResponseEntity.ok(farmer);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Disable a farmer account
     * PUT /api/subadmin/farmer/{id}/disable
     * 
     * @param farmerId ID of the farmer
     * @return Success message
     */
    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> disableFarmer(@PathVariable("id") Long farmerId) {
        try {
            farmerSubAdminService.disableFarmer(farmerId);
            return ResponseEntity.ok(new MessageResponse("Farmer disabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Enable a farmer account
     * PUT /api/subadmin/farmer/{id}/enable
     * 
     * @param farmerId ID of the farmer
     * @return Success message
     */
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> enableFarmer(@PathVariable("id") Long farmerId) {
        try {
            farmerSubAdminService.enableFarmer(farmerId);
            return ResponseEntity.ok(new MessageResponse("Farmer enabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get statistics for farmer domain
     * GET /api/subadmin/farmer/stats
     * 
     * @return Statistics map
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('FARMER_SUBADMIN')")
    public ResponseEntity<?> getStats() {
        List<User> pending = farmerSubAdminService.getPendingFarmerRegistrations();
        List<User> approved = farmerSubAdminService.getAllApprovedFarmers();

        return ResponseEntity.ok(Map.of(
                "pendingRegistrations", pending.size(),
                "approvedFarmers", approved.size(),
                "totalFarmers", pending.size() + approved.size()));
    }
}
