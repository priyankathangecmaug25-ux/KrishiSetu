package com.krishisetu.backend.controller;

import com.krishisetu.backend.dto.MessageResponse;
import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.entity.Role;
import com.krishisetu.backend.service.SuperAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    @Autowired
    private SuperAdminService superAdminService;

    /**
     * Create a new sub-admin for a specific domain
     * POST /api/superadmin/subadmin/create
     * 
     * @param user User details
     * @param role Sub-admin role (FARMER_SUBADMIN, MACHINERY_OWNER_SUBADMIN,
     *             WORKER_SUBADMIN)
     * @return Created sub-admin user
     */
    @PostMapping("/subadmin/create")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createSubAdmin(
            @RequestBody User user,
            @RequestParam String role) {
        try {
            User createdSubAdmin = superAdminService.createSubAdmin(user, role);
            return ResponseEntity.ok(Map.of(
                    "message", "Sub-admin created successfully",
                    "subAdmin", createdSubAdmin));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all sub-admins for a specific role
     * GET /api/superadmin/subadmins?role=FARMER_SUBADMIN
     * 
     * @param role The sub-admin role to filter by
     * @return List of sub-admins with the specified role
     */
    @GetMapping("/subadmins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getSubAdminsByRole(@RequestParam String role) {
        try {
            List<User> subAdmins = superAdminService.getAllSubAdminsByRole(role);
            return ResponseEntity.ok(subAdmins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all sub-admins across all domains
     * GET /api/superadmin/all-subadmins
     * 
     * @return List of all sub-admins
     */
    @GetMapping("/all-subadmins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllSubAdmins() {
        List<User> subAdmins = superAdminService.getAllSubAdmins();
        return ResponseEntity.ok(subAdmins);
    }

    /**
     * Get sub-admin details by ID
     * GET /api/superadmin/subadmin/{id}
     * 
     * @param subAdminId ID of the sub-admin
     * @return Sub-admin details
     */
    @GetMapping("/subadmin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getSubAdminDetails(@PathVariable Long subAdminId) {
        try {
            User subAdmin = superAdminService.getSubAdminDetails(subAdminId);
            return ResponseEntity.ok(subAdmin);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Disable a sub-admin account
     * PUT /api/superadmin/subadmin/{id}/disable
     * 
     * @param subAdminId ID of the sub-admin to disable
     * @return Success message
     */
    @PutMapping("/subadmin/{id}/disable")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> disableSubAdmin(@PathVariable Long subAdminId) {
        try {
            superAdminService.disableSubAdmin(subAdminId);
            return ResponseEntity.ok(new MessageResponse("Sub-admin disabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Enable a sub-admin account
     * PUT /api/superadmin/subadmin/{id}/enable
     * 
     * @param subAdminId ID of the sub-admin to enable
     * @return Success message
     */
    @PutMapping("/subadmin/{id}/enable")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> enableSubAdmin(@PathVariable Long subAdminId) {
        try {
            superAdminService.enableSubAdmin(subAdminId);
            return ResponseEntity.ok(new MessageResponse("Sub-admin enabled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Remove a sub-admin account
     * DELETE /api/superadmin/subadmin/{id}
     * 
     * @param subAdminId ID of the sub-admin to remove
     * @return Success message
     */
    @DeleteMapping("/subadmin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> removeSubAdmin(@PathVariable Long subAdminId) {
        try {
            superAdminService.removeSubAdmin(subAdminId);
            return ResponseEntity.ok(new MessageResponse("Sub-admin removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get statistics and summary for all domains
     * GET /api/superadmin/stats
     * 
     * @return Statistics map with counts for each domain
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getStats() {
        List<User> farmerSubAdmins = superAdminService.getAllSubAdminsByRole(Role.FARMER_SUBADMIN);
        List<User> ownerSubAdmins = superAdminService.getAllSubAdminsByRole(Role.MACHINERY_OWNER_SUBADMIN);
        List<User> workerSubAdmins = superAdminService.getAllSubAdminsByRole(Role.WORKER_SUBADMIN);

        return ResponseEntity.ok(Map.of(
                "farmerSubAdmins", farmerSubAdmins.size(),
                "machineryOwnerSubAdmins", ownerSubAdmins.size(),
                "workerSubAdmins", workerSubAdmins.size(),
                "totalSubAdmins", farmerSubAdmins.size() + ownerSubAdmins.size() + workerSubAdmins.size()));
    }
}
