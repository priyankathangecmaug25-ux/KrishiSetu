package com.krishisetu.backend.repository;

import com.krishisetu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRole(String role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.approved = false")
    List<User> findByRoleAndApprovedFalse(@Param("role") String role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.approved = true")
    List<User> findByRoleAndApprovedTrue(@Param("role") String role);

    @Query("SELECT u FROM User u WHERE u.approved = false")
    List<User> findAllPendingApprovals();
}
