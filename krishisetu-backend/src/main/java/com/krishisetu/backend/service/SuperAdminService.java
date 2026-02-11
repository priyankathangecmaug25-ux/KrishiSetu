package com.krishisetu.backend.service;

import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.entity.Role;
import com.krishisetu.backend.repository.UserRepository;
import com.krishisetu.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.HashSet;

@Service
public class SuperAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a sub-admin account for a specific domain
     * 
     * @param user         User object with basic details
     * @param subAdminRole The role of the sub-admin (FARMER_SUBADMIN,
     *                     MACHINERY_OWNER_SUBADMIN, WORKER_SUBADMIN)
     * @return Created user with assigned role
     */
    public User createSubAdmin(User user, String subAdminRole) {
        // Validate the sub-admin role
        if (!isValidSubAdminRole(subAdminRole)) {
            throw new IllegalArgumentException("Invalid sub-admin role: " + subAdminRole);
        }

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set user details
        user.setEnabled(true);
        user.setApproved(true);
        // Map incoming UI/internal value to DB role name and store it on the user
        // (e.g. incoming FARMER_SUBADMIN -> ROLE_FARMER)
        String dbRoleName = mapToDbRoleName(subAdminRole);
        user.setRole(dbRoleName);
        Optional<Role> roleOpt = roleRepository.findByName(dbRoleName);
        Role roleEntity;
        if (roleOpt.isEmpty()) {
            // If the DB role is missing, create it so super-admin can assign it immediately
            roleEntity = new Role();
            roleEntity.setName(dbRoleName);
            roleEntity = roleRepository.save(roleEntity);
        } else {
            roleEntity = roleOpt.get();
        }

        // Add role to user's roles (roles is initialized as empty HashSet in entity)
        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }
        user.getRoles().add(roleEntity);

        return userRepository.save(user);
    }

    /**
     * Get all sub-admins for a specific role
     * 
     * @param subAdminRole The role to filter by
     * @return List of sub-admins with the specified role
     */
    public List<User> getAllSubAdminsByRole(String subAdminRole) {
        if (!isValidSubAdminRole(subAdminRole)) {
            throw new IllegalArgumentException("Invalid sub-admin role: " + subAdminRole);
        }
        String dbRole = mapToDbRoleName(subAdminRole);
        return userRepository.findByRole(dbRole);
    }

    /**
     * Get all sub-admins across all domains
     * 
     * @return List of all sub-admins
     */
    public List<User> getAllSubAdmins() {
        List<User> farmers = userRepository.findByRole(mapToDbRoleName(Role.FARMER_SUBADMIN));
        List<User> owners = userRepository.findByRole(mapToDbRoleName(Role.MACHINERY_OWNER_SUBADMIN));
        List<User> workers = userRepository.findByRole(mapToDbRoleName(Role.WORKER_SUBADMIN));

        farmers.addAll(owners);
        farmers.addAll(workers);
        return farmers;
    }

    /**
     * Remove a sub-admin account
     * 
     * @param subAdminId ID of the sub-admin to remove
     */
    public void removeSubAdmin(Long subAdminId) {
        Optional<User> user = userRepository.findById(subAdminId);
        if (user.isPresent() && isSubAdmin(user.get())) {
            // Clear roles before deletion to avoid constraint violations if any
            user.get().getRoles().clear();
            userRepository.save(user.get());

            userRepository.deleteById(subAdminId);
        } else {
            throw new RuntimeException("Sub-admin not found");
        }
    }

    /**
     * Disable a sub-admin account
     * 
     * @param subAdminId ID of the sub-admin to disable
     */
    public void disableSubAdmin(Long subAdminId) {
        Optional<User> user = userRepository.findById(subAdminId);
        if (user.isPresent() && isSubAdmin(user.get())) {
            user.get().setEnabled(false);
            userRepository.save(user.get());
        } else {
            throw new RuntimeException("Sub-admin not found");
        }
    }

    /**
     * Enable a sub-admin account
     * 
     * @param subAdminId ID of the sub-admin to enable
     */
    public void enableSubAdmin(Long subAdminId) {
        Optional<User> user = userRepository.findById(subAdminId);
        if (user.isPresent() && isSubAdmin(user.get())) {
            user.get().setEnabled(true);
            userRepository.save(user.get());
        } else {
            throw new RuntimeException("Sub-admin not found");
        }
    }

    /**
     * Get sub-admin details
     * 
     * @param subAdminId ID of the sub-admin
     * @return User object of the sub-admin
     */
    public User getSubAdminDetails(Long subAdminId) {
        Optional<User> user = userRepository.findById(subAdminId);
        if (user.isPresent() && isSubAdmin(user.get())) {
            return user.get();
        }
        throw new RuntimeException("Sub-admin not found");
    }

    /**
     * Validate if a role is a valid sub-admin role
     */
    private boolean isValidSubAdminRole(String role) {
        if (role == null)
            return false;
        // Normalize: accept either plain identifiers (FARMER_SUBADMIN) or DB names
        // (ROLE_FARMER_SUBADMIN)
        String normalized = role.startsWith("ROLE_") ? role : ("ROLE_" + role);
        return normalized.equals(Role.FARMER_SUBADMIN) ||
                normalized.equals(Role.MACHINERY_OWNER_SUBADMIN) ||
                normalized.equals(Role.WORKER_SUBADMIN);
    }

    /**
     * Check if a user is a sub-admin
     */
    private boolean isSubAdmin(User user) {
        if (user.getRole() == null)
            return false;
        String r = user.getRole();
        // Accept both internal constants (e.g. FARMER_SUBADMIN) and DB names
        // (ROLE_FARMER)
        if (isValidSubAdminRole(r))
            return true;
        // map known constants to DB names and compare
        if (r.equals(mapToDbRoleName(Role.FARMER_SUBADMIN)) || r.equals(mapToDbRoleName(Role.MACHINERY_OWNER_SUBADMIN))
                || r.equals(mapToDbRoleName(Role.WORKER_SUBADMIN))) {
            return true;
        }
        return false;
    }

    /**
     * Map internal sub-admin role identifiers to database role names.
     */
    private String mapToDbRoleName(String subAdminRole) {
        if (subAdminRole == null)
            return null;
        // If caller already passes a DB-style name (starts with ROLE_), return it
        if (subAdminRole.startsWith("ROLE_"))
            return subAdminRole;
        switch (subAdminRole) {
            case "FARMER_SUBADMIN":
                return Role.FARMER_SUBADMIN;
            case "MACHINERY_OWNER_SUBADMIN":
                return Role.MACHINERY_OWNER_SUBADMIN;
            case "WORKER_SUBADMIN":
                return Role.WORKER_SUBADMIN;
            default:
                return subAdminRole;
        }
    }
}
