package com.krishisetu.backend.controller;

import com.krishisetu.backend.dto.MessageResponse;
import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.entity.Machinery;
import com.krishisetu.backend.service.MachineryOwnerSubAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subadmin/machinery")
public class MachineryOwnerSubAdminController {

    @Autowired
    private MachineryOwnerSubAdminService machineryOwnerSubAdminService;

    /**
     * Register a new machinery owner
     * POST /api/subadmin/machinery/register
     * 
     * @param owner Machinery owner user details
     * @return Registered owner
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> registerMachineryOwner(@RequestBody User owner) {
        try {
            User registeredOwner = machineryOwnerSubAdminService.registerMachineryOwner(owner);
            return ResponseEntity.ok(Map.of(
                    "message", "Machinery owner registered successfully",
                    "owner", registeredOwner));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all pending machinery owner registrations
     * GET /api/subadmin/machinery/pending-owners
     * 
     * @return List of pending owner registrations
     */
    @GetMapping("/pending-owners")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> getPendingOwnerRegistrations() {
        List<User> pendingOwners = machineryOwnerSubAdminService.getPendingOwnerRegistrations();
        return ResponseEntity.ok(pendingOwners);
    }

    /**
     * Approve machinery owner registration
     * PUT /api/subadmin/machinery/{id}/approve-owner
     * 
     * @param ownerId ID of the owner to approve
     * @return Success message
     */
    @PutMapping("/{id}/approve-owner")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> approveOwnerRegistration(@PathVariable("id") Long ownerId) {
        try {
            machineryOwnerSubAdminService.approveOwnerRegistration(ownerId);
            return ResponseEntity.ok(new MessageResponse("Owner registration approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reject machinery owner registration
     * PUT /api/subadmin/machinery/{id}/reject-owner
     * 
     * @param ownerId ID of the owner to reject
     * @return Success message
     */
    @PutMapping("/{id}/reject-owner")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> rejectOwnerRegistration(@PathVariable("id") Long ownerId) {
        try {
            machineryOwnerSubAdminService.rejectOwnerRegistration(ownerId);
            return ResponseEntity.ok(new MessageResponse("Owner registration rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all pending machinery listings for approval
     * GET /api/subadmin/machinery/pending-listings
     * 
     * @return List of pending machinery items
     */
    @GetMapping("/pending-listings")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> getPendingMachineryListings() {
        List<Machinery> pendingListings = machineryOwnerSubAdminService.getPendingMachineryListings();
        return ResponseEntity.ok(pendingListings);
    }

    /**
     * Approve machinery listing
     * PUT /api/subadmin/machinery/{id}/approve-listing
     * 
     * @param machineryId ID of the machinery to approve
     * @return Success message
     */
    @PutMapping("/{id}/approve-listing")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> approveMachineryListing(@PathVariable("id") Long machineryId) {
        try {
            machineryOwnerSubAdminService.approveMachinery(machineryId);
            return ResponseEntity.ok(new MessageResponse("Machinery listing approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reject machinery listing
     * PUT /api/subadmin/machinery/{id}/reject-listing
     * 
     * @param machineryId ID of the machinery to reject
     * @return Success message
     */
    @PutMapping("/{id}/reject-listing")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> rejectMachineryListing(@PathVariable("id") Long machineryId) {
        try {
            machineryOwnerSubAdminService.rejectMachinery(machineryId);
            return ResponseEntity.ok(new MessageResponse("Machinery listing rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all approved machinery owners
     * GET /api/subadmin/machinery/approved-owners
     * 
     * @return List of approved owners
     */
    @GetMapping("/approved-owners")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> getApprovedOwners() {
        List<User> approvedOwners = machineryOwnerSubAdminService.getAllApprovedOwners();
        return ResponseEntity.ok(approvedOwners);
    }

    /**
     * Get machinery owner details
     * GET /api/subadmin/machinery/owner/{id}
     * 
     * @param ownerId ID of the owner
     * @return Owner details
     */
    @GetMapping("/owner/{id}")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> getOwnerDetails(@PathVariable("id") Long ownerId) {
        try {
            User owner = machineryOwnerSubAdminService.getOwnerDetails(ownerId);
            return ResponseEntity.ok(owner);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Disable a machinery owner account
     * PUT /api/subadmin/machinery/{id}/disable
     * 
     * @param ownerId ID of the owner
     * @return Success message
     */
    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> disableOwner(@PathVariable("id") Long ownerId) {
        try {
            machineryOwnerSubAdminService.disableOwner(ownerId);
            return ResponseEntity.ok(new MessageResponse("Owner disabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Enable a machinery owner account
     * PUT /api/subadmin/machinery/{id}/enable
     * 
     * @param ownerId ID of the owner
     * @return Success message
     */
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> enableOwner(@PathVariable("id") Long ownerId) {
        try {
            machineryOwnerSubAdminService.enableOwner(ownerId);
            return ResponseEntity.ok(new MessageResponse("Owner enabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get statistics for machinery owner domain
     * GET /api/subadmin/machinery/stats
     * 
     * @return Statistics map
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('MACHINERY_OWNER_SUBADMIN')")
    public ResponseEntity<?> getStats() {
        List<User> pendingOwners = machineryOwnerSubAdminService.getPendingOwnerRegistrations();
        List<User> approvedOwners = machineryOwnerSubAdminService.getAllApprovedOwners();
        List<Machinery> pendingListings = machineryOwnerSubAdminService.getPendingMachineryListings();

        return ResponseEntity.ok(Map.of(
                "pendingOwnerRegistrations", pendingOwners.size(),
                "approvedOwners", approvedOwners.size(),
                "totalOwners", pendingOwners.size() + approvedOwners.size(),
                "pendingMachineryListings", pendingListings.size()));
    }
}
