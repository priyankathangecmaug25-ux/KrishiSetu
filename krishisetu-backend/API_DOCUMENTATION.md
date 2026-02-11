# KrishiSetu Sub-Admin Management System - API Documentation

## Overview
This documentation outlines the complete API endpoints for the three-tier sub-admin hierarchy system in KrishiSetu. The system consists of:
- **SuperAdmin**: Creates and manages all sub-admin accounts
- **Farmer Sub-Admin**: Manages farmer registrations and approvals
- **Machinery Owner Sub-Admin**: Manages machinery owner registrations and equipment approvals
- **Worker Sub-Admin**: Manages worker registrations and verification

---

## Authentication
All endpoints require authentication with the appropriate role:
- `SUPERADMIN` - for SuperAdmin endpoints
- `FARMER_SUBADMIN` - for Farmer Sub-Admin endpoints
- `MACHINERY_OWNER_SUBADMIN` - for Machinery Owner Sub-Admin endpoints
- `WORKER_SUBADMIN` - for Worker Sub-Admin endpoints

---

## 1. SUPERADMIN ENDPOINTS
**Base URL:** `/api/superadmin`

### 1.1 Create Sub-Admin
```
POST /api/superadmin/subadmin/create?role={ROLE}
Authorization: Bearer {JWT_TOKEN}

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

Query Parameters:
- role: FARMER_SUBADMIN | MACHINERY_OWNER_SUBADMIN | WORKER_SUBADMIN

Response (200):
{
  "message": "Sub-admin created successfully",
  "subAdmin": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "FARMER_SUBADMIN",
    "enabled": true,
    "approved": true
  }
}
```

### 1.2 Get Sub-Admins by Role
```
GET /api/superadmin/subadmins?role={ROLE}
Authorization: Bearer {JWT_TOKEN}

Query Parameters:
- role: FARMER_SUBADMIN | MACHINERY_OWNER_SUBADMIN | WORKER_SUBADMIN

Response (200):
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "FARMER_SUBADMIN",
    "enabled": true
  }
]
```

### 1.3 Get All Sub-Admins
```
GET /api/superadmin/all-subadmins
Authorization: Bearer {JWT_TOKEN}

Response (200):
[
  { "id": 1, "role": "FARMER_SUBADMIN", ... },
  { "id": 2, "role": "MACHINERY_OWNER_SUBADMIN", ... },
  { "id": 3, "role": "WORKER_SUBADMIN", ... }
]
```

### 1.4 Get Sub-Admin Details
```
GET /api/superadmin/subadmin/{id}
Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- id: Sub-admin ID

Response (200):
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "FARMER_SUBADMIN",
  "enabled": true,
  "approved": true
}
```

### 1.5 Disable Sub-Admin
```
PUT /api/superadmin/subadmin/{id}/disable
Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- id: Sub-admin ID

Response (200):
{
  "message": "Sub-admin disabled successfully"
}
```

### 1.6 Enable Sub-Admin
```
PUT /api/superadmin/subadmin/{id}/enable
Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- id: Sub-admin ID

Response (200):
{
  "message": "Sub-admin enabled successfully"
}
```

### 1.7 Remove Sub-Admin
```
DELETE /api/superadmin/subadmin/{id}
Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- id: Sub-admin ID

Response (200):
{
  "message": "Sub-admin removed successfully"
}
```

### 1.8 Get Statistics
```
GET /api/superadmin/stats
Authorization: Bearer {JWT_TOKEN}

Response (200):
{
  "farmerSubAdmins": 2,
  "machineryOwnerSubAdmins": 1,
  "workerSubAdmins": 2,
  "totalSubAdmins": 5
}
```

---

## 2. FARMER SUB-ADMIN ENDPOINTS
**Base URL:** `/api/subadmin/farmer`

### 2.1 Register Farmer
```
POST /api/subadmin/farmer/register
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Request Body:
{
  "firstName": "Ramesh",
  "lastName": "Kumar",
  "email": "ramesh@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Farmer registered successfully",
  "farmer": {
    "id": 10,
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "email": "ramesh@example.com",
    "role": "FARMER",
    "enabled": true,
    "approved": false
  }
}
```

### 2.2 Get Pending Farmer Registrations
```
GET /api/subadmin/farmer/pending
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Response (200):
[
  {
    "id": 10,
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "email": "ramesh@example.com",
    "approved": false
  }
]
```

### 2.3 Approve Farmer Registration
```
PUT /api/subadmin/farmer/{id}/approve
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Path Parameters:
- id: Farmer ID

Response (200):
{
  "message": "Farmer registration approved"
}
```

### 2.4 Reject Farmer Registration
```
PUT /api/subadmin/farmer/{id}/reject
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Path Parameters:
- id: Farmer ID

Response (200):
{
  "message": "Farmer registration rejected"
}
```

### 2.5 Get Approved Farmers
```
GET /api/subadmin/farmer/approved
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Response (200):
[
  {
    "id": 10,
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "email": "ramesh@example.com",
    "approved": true
  }
]
```

### 2.6 Get Farmer Details
```
GET /api/subadmin/farmer/{id}
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Path Parameters:
- id: Farmer ID

Response (200):
{
  "id": 10,
  "firstName": "Ramesh",
  "lastName": "Kumar",
  "email": "ramesh@example.com",
  "role": "FARMER",
  "enabled": true
}
```

### 2.7 Disable Farmer
```
PUT /api/subadmin/farmer/{id}/disable
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Path Parameters:
- id: Farmer ID

Response (200):
{
  "message": "Farmer disabled successfully"
}
```

### 2.8 Enable Farmer
```
PUT /api/subadmin/farmer/{id}/enable
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Path Parameters:
- id: Farmer ID

Response (200):
{
  "message": "Farmer enabled successfully"
}
```

### 2.9 Get Farmer Statistics
```
GET /api/subadmin/farmer/stats
Authorization: Bearer {FARMER_SUBADMIN_TOKEN}

Response (200):
{
  "pendingRegistrations": 5,
  "approvedFarmers": 15,
  "totalFarmers": 20
}
```

---

## 3. MACHINERY OWNER SUB-ADMIN ENDPOINTS
**Base URL:** `/api/subadmin/machinery`

### 3.1 Register Machinery Owner
```
POST /api/subadmin/machinery/register
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Request Body:
{
  "firstName": "Suresh",
  "lastName": "Singh",
  "email": "suresh@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Machinery owner registered successfully",
  "owner": {
    "id": 20,
    "firstName": "Suresh",
    "lastName": "Singh",
    "email": "suresh@example.com",
    "role": "MACHINERY_OWNER",
    "approved": false
  }
}
```

### 3.2 Get Pending Owner Registrations
```
GET /api/subadmin/machinery/pending-owners
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Response (200):
[
  {
    "id": 20,
    "firstName": "Suresh",
    "lastName": "Singh",
    "email": "suresh@example.com",
    "approved": false
  }
]
```

### 3.3 Approve Owner Registration
```
PUT /api/subadmin/machinery/{id}/approve-owner
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Path Parameters:
- id: Owner ID

Response (200):
{
  "message": "Owner registration approved"
}
```

### 3.4 Reject Owner Registration
```
PUT /api/subadmin/machinery/{id}/reject-owner
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Path Parameters:
- id: Owner ID

Response (200):
{
  "message": "Owner registration rejected"
}
```

### 3.5 Get Pending Machinery Listings
```
GET /api/subadmin/machinery/pending-listings
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Response (200):
[
  {
    "id": 100,
    "name": "Tractor JCB",
    "category": "Heavy Machinery",
    "approved": false,
    "owner": { "id": 20, "name": "Suresh Singh" }
  }
]
```

### 3.6 Approve Machinery Listing
```
PUT /api/subadmin/machinery/{id}/approve-listing
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Path Parameters:
- id: Machinery ID

Response (200):
{
  "message": "Machinery listing approved"
}
```

### 3.7 Reject Machinery Listing
```
PUT /api/subadmin/machinery/{id}/reject-listing
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Path Parameters:
- id: Machinery ID

Response (200):
{
  "message": "Machinery listing rejected"
}
```

### 3.8 Get Approved Owners
```
GET /api/subadmin/machinery/approved-owners
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Response (200):
[
  {
    "id": 20,
    "firstName": "Suresh",
    "lastName": "Singh",
    "email": "suresh@example.com",
    "approved": true
  }
]
```

### 3.9 Get Owner Details
```
GET /api/subadmin/machinery/owner/{id}
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Path Parameters:
- id: Owner ID

Response (200):
{
  "id": 20,
  "firstName": "Suresh",
  "lastName": "Singh",
  "email": "suresh@example.com",
  "role": "MACHINERY_OWNER",
  "enabled": true
}
```

### 3.10 Disable Owner
```
PUT /api/subadmin/machinery/{id}/disable
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Path Parameters:
- id: Owner ID

Response (200):
{
  "message": "Owner disabled successfully"
}
```

### 3.11 Enable Owner
```
PUT /api/subadmin/machinery/{id}/enable
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Path Parameters:
- id: Owner ID

Response (200):
{
  "message": "Owner enabled successfully"
}
```

### 3.12 Get Machinery Statistics
```
GET /api/subadmin/machinery/stats
Authorization: Bearer {MACHINERY_OWNER_SUBADMIN_TOKEN}

Response (200):
{
  "pendingOwnerRegistrations": 3,
  "approvedOwners": 8,
  "totalOwners": 11,
  "pendingMachineryListings": 5
}
```

---

## 4. WORKER SUB-ADMIN ENDPOINTS
**Base URL:** `/api/subadmin/worker`

### 4.1 Register Worker
```
POST /api/subadmin/worker/register
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Request Body:
{
  "firstName": "Arjun",
  "lastName": "Sharma",
  "email": "arjun@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Worker registered successfully",
  "worker": {
    "id": 30,
    "firstName": "Arjun",
    "lastName": "Sharma",
    "email": "arjun@example.com",
    "role": "WORKER",
    "approved": false
  }
}
```

### 4.2 Get Pending Worker Registrations
```
GET /api/subadmin/worker/pending
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Response (200):
[
  {
    "id": 30,
    "firstName": "Arjun",
    "lastName": "Sharma",
    "email": "arjun@example.com",
    "approved": false
  }
]
```

### 4.3 Approve Worker Registration
```
PUT /api/subadmin/worker/{id}/approve
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Path Parameters:
- id: Worker ID

Response (200):
{
  "message": "Worker registration approved"
}
```

### 4.4 Reject Worker Registration
```
PUT /api/subadmin/worker/{id}/reject
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Path Parameters:
- id: Worker ID

Response (200):
{
  "message": "Worker registration rejected"
}
```

### 4.5 Get Approved Workers
```
GET /api/subadmin/worker/approved
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Response (200):
[
  {
    "id": 30,
    "firstName": "Arjun",
    "lastName": "Sharma",
    "email": "arjun@example.com",
    "approved": true
  }
]
```

### 4.6 Get Worker Details
```
GET /api/subadmin/worker/{id}
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Path Parameters:
- id: Worker ID

Response (200):
{
  "id": 30,
  "firstName": "Arjun",
  "lastName": "Sharma",
  "email": "arjun@example.com",
  "role": "WORKER",
  "enabled": true
}
```

### 4.7 Verify Worker Documents
```
PUT /api/subadmin/worker/{id}/verify
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Path Parameters:
- id: Worker ID

Response (200):
{
  "message": "Worker documents verified"
}
```

### 4.8 Disable Worker
```
PUT /api/subadmin/worker/{id}/disable
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Path Parameters:
- id: Worker ID

Response (200):
{
  "message": "Worker disabled successfully"
}
```

### 4.9 Enable Worker
```
PUT /api/subadmin/worker/{id}/enable
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Path Parameters:
- id: Worker ID

Response (200):
{
  "message": "Worker enabled successfully"
}
```

### 4.10 Get Worker Statistics
```
GET /api/subadmin/worker/stats
Authorization: Bearer {WORKER_SUBADMIN_TOKEN}

Response (200):
{
  "pendingRegistrations": 4,
  "approvedWorkers": 25,
  "totalWorkers": 29
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Email already registered" | "Invalid sub-admin role" | etc.
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Access Denied"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

---

## Role Hierarchy

```
SuperAdmin (SUPERADMIN)
    ├── Farmer Sub-Admin (FARMER_SUBADMIN)
    │   └── Manages: Farmer registrations and approvals
    ├── Machinery Owner Sub-Admin (MACHINERY_OWNER_SUBADMIN)
    │   └── Manages: Owner registrations, approvals, machinery listings
    └── Worker Sub-Admin (WORKER_SUBADMIN)
        └── Manages: Worker registrations, approvals, document verification
```

---

## Status Codes Summary
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Implementation Notes
1. All endpoints are protected by Spring Security with role-based access control
2. Passwords are encoded using BCryptPasswordEncoder
3. JWT tokens are required for authentication
4. Date/Time operations are handled in UTC timezone
5. All user data is validated before persistence
