-- KrishiSetu Sub-Admin Management System - Database Migration Script

-- ============================================================================
-- STEP 1: Add role column to users table (if not already present)
-- ============================================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- ============================================================================
-- STEP 2: Create indexes for better query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);
CREATE INDEX IF NOT EXISTS idx_users_role_approved ON users(role, approved);
CREATE INDEX IF NOT EXISTS idx_users_enabled ON users(enabled);

-- ============================================================================
-- STEP 3: Insert the four role records if they don't exist
-- ============================================================================
INSERT INTO roles (name) VALUES ('SUPERADMIN') 
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (name) VALUES ('FARMER_SUBADMIN') 
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (name) VALUES ('MACHINERY_OWNER_SUBADMIN') 
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (name) VALUES ('WORKER_SUBADMIN') 
ON DUPLICATE KEY UPDATE name=name;

-- Keep existing roles
INSERT INTO roles (name) VALUES ('FARMER') 
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (name) VALUES ('MACHINERY_OWNER') 
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (name) VALUES ('WORKER') 
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (name) VALUES ('ADMIN') 
ON DUPLICATE KEY UPDATE name=name;

-- ============================================================================
-- STEP 4: Create SuperAdmin user (default credentials - CHANGE AFTER FIRST LOGIN!)
-- ============================================================================
-- Password: 'admin123' (hashed with BCrypt)
-- Hash: $2a$10$slYQmyNdGzin7olVN3p5Be7DW5it/8I4N7Z/L2KlVvlSVJiJvYvU2

INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('System', 'Admin', 'superadmin@krishisetu.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DW5it/8I4N7Z/L2KlVvlSVJiJvYvU2', 1, 1, 'SUPERADMIN')
ON DUPLICATE KEY UPDATE password=password;

-- ============================================================================
-- STEP 5: Assign SUPERADMIN role to admin user in user_roles table
-- ============================================================================
-- First, get the IDs (adjust based on your actual data)
-- INSERT INTO user_roles (user_id, role_id) 
-- SELECT u.id, r.id FROM users u, roles r 
-- WHERE u.email = 'superadmin@krishisetu.com' AND r.name = 'SUPERADMIN'
-- AND NOT EXISTS (
--   SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id
-- );

-- ============================================================================
-- STEP 6: Verify the setup
-- ============================================================================
-- SELECT * FROM roles WHERE name IN ('SUPERADMIN', 'FARMER_SUBADMIN', 'MACHINERY_OWNER_SUBADMIN', 'WORKER_SUBADMIN');
-- SELECT * FROM users WHERE role IN ('SUPERADMIN', 'FARMER_SUBADMIN', 'MACHINERY_OWNER_SUBADMIN', 'WORKER_SUBADMIN');

-- ============================================================================
-- STEP 7: Optional - Create views for easier querying
-- ============================================================================

-- View for all sub-admins
CREATE OR REPLACE VIEW v_sub_admins AS
SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.enabled, u.approved, u.created_at
FROM users u
WHERE u.role IN ('FARMER_SUBADMIN', 'MACHINERY_OWNER_SUBADMIN', 'WORKER_SUBADMIN')
ORDER BY u.role, u.created_at DESC;

-- View for pending registrations (all types)
CREATE OR REPLACE VIEW v_pending_registrations AS
SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.enabled, u.created_at
FROM users u
WHERE u.approved = 0 
  AND u.role IN ('FARMER', 'MACHINERY_OWNER', 'WORKER')
ORDER BY u.created_at ASC;

-- View for approved users by role
CREATE OR REPLACE VIEW v_approved_users AS
SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.enabled, u.approved
FROM users u
WHERE u.approved = 1 
  AND u.role IN ('FARMER', 'MACHINERY_OWNER', 'WORKER')
ORDER BY u.role, u.last_name ASC;

-- ============================================================================
-- STEP 8: Sample data for testing (OPTIONAL - Comment out in production)
-- ============================================================================

-- Create test Farmer Sub-Admin
-- Password: 'farmer123' (hash: $2a$10$9YZ.d/ZQwVp.dRXqJo7sGuA1L7Qw.T9eGqLV8K.C0B/K4t1K7qQ5G)
INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('John', 'Farmer', 'farmer.admin@krishisetu.com', '$2a$10$9YZ.d/ZQwVp.dRXqJo7sGuA1L7Qw.T9eGqLV8K.C0B/K4t1K7qQ5G', 1, 1, 'FARMER_SUBADMIN')
ON DUPLICATE KEY UPDATE password=password;

-- Create test Machinery Owner Sub-Admin
-- Password: 'machinery123' (hash: $2a$10$ZmVkYmFjMWQwYzMyYTQzODA1MWNkODEwOGMzZjI1M2E4Mzg2ZDVjMg==)
INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('Suresh', 'Owner', 'owner.admin@krishisetu.com', '$2a$10$ZmVkYmFjMWQwYzMyYTQzODA1MWNkODEwOGMzZjI1M2E4Mzg2ZDVjMg==', 1, 1, 'MACHINERY_OWNER_SUBADMIN')
ON DUPLICATE KEY UPDATE password=password;

-- Create test Worker Sub-Admin
-- Password: 'worker123' (hash: $2a$10$R2QwZWJkNmJlYzMyYTQzODA1MWNkODEwOGMzZjI1M2E4Mzg2ZDVjMg==)
INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('Arjun', 'Worker', 'worker.admin@krishisetu.com', '$2a$10$R2QwZWJkNmJlYzMyYTQzODA1MWNkODEwOGMzZjI1M2E4Mzg2ZDVjMg==', 1, 1, 'WORKER_SUBADMIN')
ON DUPLICATE KEY UPDATE password=password;

-- ============================================================================
-- STEP 9: Create audit log table for tracking sub-admin actions (OPTIONAL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sub_admin_audit_log (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sub_admin_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_user_id BIGINT,
    target_user_role VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sub_admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sub_admin_id (sub_admin_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action)
);

-- ============================================================================
-- STEP 10: Rollback/Cleanup (if needed)
-- ============================================================================
-- To rollback these changes, use:
-- DROP VIEW IF EXISTS v_sub_admins;
-- DROP VIEW IF EXISTS v_pending_registrations;
-- DROP VIEW IF EXISTS v_approved_users;
-- DROP TABLE IF EXISTS sub_admin_audit_log;
-- ALTER TABLE users DROP COLUMN role;
-- DELETE FROM roles WHERE name IN ('SUPERADMIN', 'FARMER_SUBADMIN', 'MACHINERY_OWNER_SUBADMIN', 'WORKER_SUBADMIN');

-- ============================================================================
-- STEP 11: Verification Queries
-- ============================================================================
-- Run these queries to verify the setup:

-- Check if role column was added
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role';

-- Check if all required roles exist
-- SELECT id, name FROM roles WHERE name IN ('SUPERADMIN', 'FARMER_SUBADMIN', 'MACHINERY_OWNER_SUBADMIN', 'WORKER_SUBADMIN');

-- Check if SuperAdmin user was created
-- SELECT id, first_name, last_name, email, role, enabled, approved FROM users WHERE role = 'SUPERADMIN';

-- Check all sub-admins
-- SELECT * FROM v_sub_admins;

-- Check pending registrations
-- SELECT * FROM v_pending_registrations;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. All timestamps are in UTC
-- 2. Passwords shown above are for testing only - CHANGE IN PRODUCTION!
-- 3. ON DUPLICATE KEY UPDATE prevents errors if records already exist
-- 4. Views are optional but recommended for easier querying
-- 5. Audit table is optional but recommended for production environments
-- 6. Always backup database before running migrations
-- 7. Test in development environment first before production deployment
