# KrishiSetu Sub-Admin Management System - Implementation Guide

## System Overview

This document outlines the complete implementation of a three-tier sub-admin hierarchy for the KrishiSetu backend. The system enables a SuperAdmin to create and manage three distinct sub-admin roles, each responsible for managing specific user types and their related processes.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SuperAdmin (SUPERADMIN)                  │
│              (Creates and manages all sub-admins)           │
└─────────────────┬──────────────┬──────────────┬─────────────┘
                  │              │              │
        ┌─────────▼─┐    ┌──────▼──────┐   ┌──▼──────────────┐
        │  Farmer   │    │ Machinery   │   │     Worker      │
        │ Sub-Admin │    │ Owner Sub-  │   │  Sub-Admin      │
        │           │    │ Admin       │   │                 │
        └─────────┬─┘    └──────┬──────┘   └──┬───────────────┘
                  │             │            │
        ┌─────────▼─┐  ┌────────▼──────┐  ┌─▼────────────┐
        │  Farmers  │  │ Machinery     │  │  Workers     │
        │           │  │ Owners        │  │              │
        │           │  │               │  │              │
        │ Manages:  │  │ Manages:      │  │ Manages:     │
        │ - Reg.    │  │ - Owner Reg.  │  │ - Reg.       │
        │ - Approval│  │ - Approval    │  │ - Approval   │
        │ - Disable │  │ - Machinery   │  │ - Verify Doc │
        │ - Enable  │  │   Listings    │  │ - Disable    │
        │           │  │ - Disable     │  │ - Enable     │
        └───────────┘  └───────────────┘  └──────────────┘
```

---

## Components Implemented

### 1. Entity Layer

#### Updated: `User.java`
- Added `role` field to store user's role (FARMER, MACHINERY_OWNER, WORKER, FARMER_SUBADMIN, etc.)
- Maintains existing `roles` field for Spring Security integration

#### Updated: `Role.java`
- Added constants for new sub-admin roles:
  - `SUPERADMIN`
  - `FARMER_SUBADMIN`
  - `MACHINERY_OWNER_SUBADMIN`
  - `WORKER_SUBADMIN`

### 2. Repository Layer

#### Updated: `UserRepository.java`
Added custom query methods:
```java
List<User> findByRole(String role);
List<User> findByRoleAndApprovedFalse(String role);  // Get pending registrations
List<User> findByRoleAndApprovedTrue(String role);   // Get approved users
List<User> findAllPendingApprovals();                 // Get all pending approvals
```

---

### 3. Service Layer

#### SuperAdminService.java (NEW)
Manages sub-admin creation and lifecycle:
- `createSubAdmin(User, String role)` - Create sub-admin for specific role
- `getAllSubAdminsByRole(String role)` - Get sub-admins by role
- `getAllSubAdmins()` - Get all sub-admins across domains
- `getSubAdminDetails(Long subAdminId)` - Get specific sub-admin
- `disableSubAdmin(Long subAdminId)` - Disable sub-admin account
- `enableSubAdmin(Long subAdminId)` - Enable sub-admin account
- `removeSubAdmin(Long subAdminId)` - Remove sub-admin account

#### FarmerSubAdminService.java (NEW)
Manages farmer registrations and approvals:
- `registerFarmer(User farmer)` - Register new farmer
- `getPendingFarmerRegistrations()` - Get unapproved farmer registrations
- `approveFarmerRegistration(Long farmerId)` - Approve farmer
- `rejectFarmerRegistration(Long farmerId)` - Reject farmer
- `getAllApprovedFarmers()` - Get approved farmers
- `getFarmerDetails(Long farmerId)` - Get farmer information
- `disableFarmer(Long farmerId)` - Disable farmer account
- `enableFarmer(Long farmerId)` - Enable farmer account

#### MachineryOwnerSubAdminService.java (NEW)
Manages machinery owner registrations and equipment listings:
- `registerMachineryOwner(User owner)` - Register new machinery owner
- `getPendingOwnerRegistrations()` - Get unapproved owner registrations
- `approveOwnerRegistration(Long ownerId)` - Approve owner
- `rejectOwnerRegistration(Long ownerId)` - Reject owner
- `getPendingMachineryListings()` - Get unapproved machinery for approval
- `approveMachinery(Long machineryId)` - Approve machinery listing
- `rejectMachinery(Long machineryId)` - Reject machinery listing
- `getAllApprovedOwners()` - Get approved owners
- `getOwnerDetails(Long ownerId)` - Get owner information
- `disableOwner(Long ownerId)` - Disable owner account
- `enableOwner(Long ownerId)` - Enable owner account

#### WorkerSubAdminService.java (NEW)
Manages worker registrations and verification:
- `registerWorker(User worker)` - Register new worker
- `getPendingWorkerRegistrations()` - Get unapproved worker registrations
- `approveWorkerRegistration(Long workerId)` - Approve worker
- `rejectWorkerRegistration(Long workerId)` - Reject worker
- `getAllApprovedWorkers()` - Get approved workers
- `getWorkerDetails(Long workerId)` - Get worker information
- `verifyWorkerDocuments(Long workerId)` - Verify worker documents
- `disableWorker(Long workerId)` - Disable worker account
- `enableWorker(Long workerId)` - Enable worker account

### 4. Controller Layer

#### SuperAdminController.java (NEW)
REST endpoints for SuperAdmin operations:
- `POST /api/superadmin/subadmin/create` - Create sub-admin
- `GET /api/superadmin/subadmins` - Get sub-admins by role
- `GET /api/superadmin/all-subadmins` - Get all sub-admins
- `GET /api/superadmin/subadmin/{id}` - Get sub-admin details
- `PUT /api/superadmin/subadmin/{id}/disable` - Disable sub-admin
- `PUT /api/superadmin/subadmin/{id}/enable` - Enable sub-admin
- `DELETE /api/superadmin/subadmin/{id}` - Remove sub-admin
- `GET /api/superadmin/stats` - Get statistics

#### FarmerSubAdminController.java (NEW)
REST endpoints for Farmer Sub-Admin operations:
- `POST /api/subadmin/farmer/register` - Register farmer
- `GET /api/subadmin/farmer/pending` - Get pending registrations
- `PUT /api/subadmin/farmer/{id}/approve` - Approve farmer
- `PUT /api/subadmin/farmer/{id}/reject` - Reject farmer
- `GET /api/subadmin/farmer/approved` - Get approved farmers
- `GET /api/subadmin/farmer/{id}` - Get farmer details
- `PUT /api/subadmin/farmer/{id}/disable` - Disable farmer
- `PUT /api/subadmin/farmer/{id}/enable` - Enable farmer
- `GET /api/subadmin/farmer/stats` - Get statistics

#### MachineryOwnerSubAdminController.java (NEW)
REST endpoints for Machinery Owner Sub-Admin operations:
- `POST /api/subadmin/machinery/register` - Register machinery owner
- `GET /api/subadmin/machinery/pending-owners` - Get pending owner registrations
- `PUT /api/subadmin/machinery/{id}/approve-owner` - Approve owner
- `PUT /api/subadmin/machinery/{id}/reject-owner` - Reject owner
- `GET /api/subadmin/machinery/pending-listings` - Get pending machinery listings
- `PUT /api/subadmin/machinery/{id}/approve-listing` - Approve machinery
- `PUT /api/subadmin/machinery/{id}/reject-listing` - Reject machinery
- `GET /api/subadmin/machinery/approved-owners` - Get approved owners
- `GET /api/subadmin/machinery/owner/{id}` - Get owner details
- `PUT /api/subadmin/machinery/{id}/disable` - Disable owner
- `PUT /api/subadmin/machinery/{id}/enable` - Enable owner
- `GET /api/subadmin/machinery/stats` - Get statistics

#### WorkerSubAdminController.java (NEW)
REST endpoints for Worker Sub-Admin operations:
- `POST /api/subadmin/worker/register` - Register worker
- `GET /api/subadmin/worker/pending` - Get pending registrations
- `PUT /api/subadmin/worker/{id}/approve` - Approve worker
- `PUT /api/subadmin/worker/{id}/reject` - Reject worker
- `GET /api/subadmin/worker/approved` - Get approved workers
- `GET /api/subadmin/worker/{id}` - Get worker details
- `PUT /api/subadmin/worker/{id}/verify` - Verify documents
- `PUT /api/subadmin/worker/{id}/disable` - Disable worker
- `PUT /api/subadmin/worker/{id}/enable` - Enable worker
- `GET /api/subadmin/worker/stats` - Get statistics

---

## User Roles and Responsibilities

### SuperAdmin (SUPERADMIN)
**Responsibilities:**
- Create sub-admin accounts for all three domains
- View and manage all sub-admins
- Enable/disable sub-admin accounts
- Remove sub-admin accounts
- View overall statistics

**Cannot:**
- Directly manage farmers, machinery owners, or workers
- Modify sub-admin roles

### Farmer Sub-Admin (FARMER_SUBADMIN)
**Responsibilities:**
- Register new farmers in the system
- Review pending farmer registrations
- Approve or reject farmer registrations
- Manage farmer accounts (enable/disable)
- View farmer statistics and information

**Can Access:**
- Farmer registration data
- Pending approval queue
- Approved farmer list

### Machinery Owner Sub-Admin (MACHINERY_OWNER_SUBADMIN)
**Responsibilities:**
- Register new machinery owners
- Review and approve/reject machinery owner registrations
- Review and approve/reject machinery listings
- Manage machinery owner accounts
- View owner and machinery statistics

**Can Access:**
- Machinery owner registration data
- Pending machinery listings
- Approved owner list

### Worker Sub-Admin (WORKER_SUBADMIN)
**Responsibilities:**
- Register new workers
- Review pending worker registrations
- Approve or reject worker registrations
- Verify worker documents and credentials
- Manage worker accounts

**Can Access:**
- Worker registration data
- Pending verification queue
- Approved worker list

---

## Data Flow Diagrams

### Farmer Registration Flow
```
Farmer Registration Request
         │
         ▼
[Farmer Sub-Admin] registers farmer → User record created (approved=false)
         │
         ▼
[Farmer Sub-Admin] reviews pending registrations
         │
    ┌────┴────┐
    ▼         ▼
 Approve   Reject
    │         │
    ▼         ▼
approved=true  Record deleted
```

### Machinery Approval Flow
```
Machinery Listing Request
         │
         ▼
Owner uploads machinery → Machinery record (approved=false)
         │
         ▼
[Machinery Owner Sub-Admin] reviews pending listings
         │
    ┌────┴────┐
    ▼         ▼
 Approve   Reject
    │         │
    ▼         ▼
approved=true  Record deleted
```

---

## Security Features

1. **Role-Based Access Control (RBAC)**
   - @PreAuthorize annotations on all endpoints
   - Each role can only access their specific endpoints

2. **Password Encryption**
   - All user passwords encoded with BCryptPasswordEncoder
   - During sub-admin creation, passwords are encoded

3. **JWT Authentication**
   - All API requests require valid JWT token
   - Token includes user role information

4. **Data Validation**
   - Email uniqueness validation
   - User role validation
   - All inputs validated before persistence

---

## Database Schema Changes

### users table (Updated)
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(50);
```

### Example Data
```sql
-- SuperAdmin
INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('Admin', 'Super', 'superadmin@krishisetu.com', 'encrypted_password', true, true, 'SUPERADMIN');

-- Farmer Sub-Admin
INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('John', 'Farmer', 'farmer.admin@krishisetu.com', 'encrypted_password', true, true, 'FARMER_SUBADMIN');

-- Machinery Owner Sub-Admin
INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('Suresh', 'Owner', 'owner.admin@krishisetu.com', 'encrypted_password', true, true, 'MACHINERY_OWNER_SUBADMIN');

-- Worker Sub-Admin
INSERT INTO users (first_name, last_name, email, password, enabled, approved, role) 
VALUES ('Arjun', 'Worker', 'worker.admin@krishisetu.com', 'encrypted_password', true, true, 'WORKER_SUBADMIN');
```

---

## Testing Checklist

- [ ] SuperAdmin can create Farmer Sub-Admin
- [ ] SuperAdmin can create Machinery Owner Sub-Admin
- [ ] SuperAdmin can create Worker Sub-Admin
- [ ] Farmer Sub-Admin can register farmers
- [ ] Farmer Sub-Admin can approve/reject farmers
- [ ] Machinery Owner Sub-Admin can register owners
- [ ] Machinery Owner Sub-Admin can approve/reject machinery listings
- [ ] Worker Sub-Admin can register workers
- [ ] Worker Sub-Admin can verify worker documents
- [ ] Non-authorized users cannot access restricted endpoints
- [ ] Disabled sub-admins cannot perform actions
- [ ] Statistics endpoints return correct counts

---

## API Usage Examples

### 1. SuperAdmin Creates Farmer Sub-Admin
```bash
curl -X POST http://localhost:8080/api/superadmin/subadmin/create?role=FARMER_SUBADMIN \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

### 2. Farmer Sub-Admin Registers Farmer
```bash
curl -X POST http://localhost:8080/api/subadmin/farmer/register \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "email": "ramesh@example.com",
    "password": "FarmerPass123"
  }'
```

### 3. Farmer Sub-Admin Approves Farmer Registration
```bash
curl -X PUT http://localhost:8080/api/subadmin/farmer/1/approve \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT_TOKEN"
```

### 4. Get Statistics
```bash
curl -X GET http://localhost:8080/api/superadmin/stats \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN"
```

---

## Future Enhancements

1. **Audit Logging** - Track all approvals and rejections
2. **Notifications** - Email notifications for registration status
3. **Dashboard** - UI for sub-admin management
4. **Reports** - Export statistics and user data
5. **Multi-language Support** - Internationalization for error messages
6. **Rate Limiting** - API rate limiting for production
7. **Two-Factor Authentication** - Additional security layer
8. **Activity History** - Track sub-admin actions

---

## Troubleshooting

### Issue: "User not found" error
- Verify user ID exists in database
- Check role matches user's actual role

### Issue: "Access Denied" error
- Verify JWT token is valid
- Check user has correct role
- Ensure @PreAuthorize annotation matches user's role

### Issue: Duplicate email error
- Verify email is unique
- Check database for existing email addresses

---

## Files Modified/Created

### Created Files:
1. SuperAdminService.java
2. FarmerSubAdminService.java
3. MachineryOwnerSubAdminService.java
4. WorkerSubAdminService.java
5. SuperAdminController.java
6. FarmerSubAdminController.java
7. MachineryOwnerSubAdminController.java
8. WorkerSubAdminController.java
9. API_DOCUMENTATION.md

### Modified Files:
1. Role.java - Added role constants
2. User.java - Added role field
3. UserRepository.java - Added custom query methods

---

## Conclusion

This implementation provides a complete, scalable, and secure sub-admin management system for KrishiSetu. The three-tier hierarchy allows efficient management of different user types while maintaining clear separation of responsibilities and robust access control.
