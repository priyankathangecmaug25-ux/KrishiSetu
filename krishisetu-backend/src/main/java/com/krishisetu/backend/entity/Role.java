package com.krishisetu.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    // Role constants for sub-admin roles
    // Role constants (use DB naming with ROLE_ prefix)
    public static final String SUPERADMIN = "ROLE_SUPER_ADMIN";
    public static final String FARMER_SUBADMIN = "ROLE_FARMER_SUBADMIN";
    public static final String MACHINERY_OWNER_SUBADMIN = "ROLE_MACHINERY_OWNER_SUBADMIN";
    public static final String WORKER_SUBADMIN = "ROLE_WORKER_SUBADMIN";
}
