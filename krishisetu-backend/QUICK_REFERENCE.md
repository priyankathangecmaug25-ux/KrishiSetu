# KrishiSetu Sub-Admin System - Quick Reference Guide

## 🚀 Quick Start

### Default SuperAdmin Credentials
```
Email: superadmin@krishisetu.com
Password: admin123
```

### Available Roles
- `SUPERADMIN` - Creates and manages sub-admins
- `FARMER_SUBADMIN` - Manages farmer registrations
- `MACHINERY_OWNER_SUBADMIN` - Manages machinery owner registrations and equipment
- `WORKER_SUBADMIN` - Manages worker registrations and verification

---

## 📍 API Base URLs

```
SuperAdmin:           /api/superadmin
Farmer Sub-Admin:     /api/subadmin/farmer
Machinery Sub-Admin:  /api/subadmin/machinery
Worker Sub-Admin:     /api/subadmin/worker
```

---

## 🔑 Common Operations

### Create Sub-Admin (SuperAdmin only)
```bash
curl -X POST "http://localhost:8080/api/superadmin/subadmin/create?role=FARMER_SUBADMIN" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Sub-Admins (SuperAdmin only)
```bash
curl -X GET "http://localhost:8080/api/superadmin/all-subadmins" \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Register User (Sub-Admin)
```bash
# Farmer
curl -X POST "http://localhost:8080/api/subadmin/farmer/register" \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Name","lastName":"Last","email":"email@example.com","password":"pass123"}'

# Machinery Owner
curl -X POST "http://localhost:8080/api/subadmin/machinery/register" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Name","lastName":"Last","email":"email@example.com","password":"pass123"}'

# Worker
curl -X POST "http://localhost:8080/api/subadmin/worker/register" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Name","lastName":"Last","email":"email@example.com","password":"pass123"}'
```

### Get Pending Registrations (Sub-Admin)
```bash
# Farmer pending
curl -X GET "http://localhost:8080/api/subadmin/farmer/pending" \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT"

# Machinery pending owners
curl -X GET "http://localhost:8080/api/subadmin/machinery/pending-owners" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT"

# Worker pending
curl -X GET "http://localhost:8080/api/subadmin/worker/pending" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT"
```

### Approve Registration (Sub-Admin)
```bash
# Farmer
curl -X PUT "http://localhost:8080/api/subadmin/farmer/1/approve" \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT"

# Machinery Owner
curl -X PUT "http://localhost:8080/api/subadmin/machinery/1/approve-owner" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT"

# Worker
curl -X PUT "http://localhost:8080/api/subadmin/worker/1/approve" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT"
```

### Reject Registration (Sub-Admin)
```bash
# Farmer
curl -X PUT "http://localhost:8080/api/subadmin/farmer/1/reject" \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT"

# Machinery Owner
curl -X PUT "http://localhost:8080/api/subadmin/machinery/1/reject-owner" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT"

# Worker
curl -X PUT "http://localhost:8080/api/subadmin/worker/1/reject" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT"
```

### Get Statistics (Sub-Admin)
```bash
# Farmer stats
curl -X GET "http://localhost:8080/api/subadmin/farmer/stats" \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT"

# Machinery stats
curl -X GET "http://localhost:8080/api/subadmin/machinery/stats" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT"

# Worker stats
curl -X GET "http://localhost:8080/api/subadmin/worker/stats" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT"
```

### Approve Machinery Listing (Machinery Sub-Admin)
```bash
curl -X PUT "http://localhost:8080/api/subadmin/machinery/1/approve-listing" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT"
```

### Verify Worker Documents (Worker Sub-Admin)
```bash
curl -X PUT "http://localhost:8080/api/subadmin/worker/1/verify" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT"
```

### Disable User (Sub-Admin)
```bash
# Farmer
curl -X PUT "http://localhost:8080/api/subadmin/farmer/1/disable" \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT"

# Machinery Owner
curl -X PUT "http://localhost:8080/api/subadmin/machinery/1/disable" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT"

# Worker
curl -X PUT "http://localhost:8080/api/subadmin/worker/1/disable" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT"
```

### Enable User (Sub-Admin)
```bash
# Farmer
curl -X PUT "http://localhost:8080/api/subadmin/farmer/1/enable" \
  -H "Authorization: Bearer FARMER_SUBADMIN_JWT"

# Machinery Owner
curl -X PUT "http://localhost:8080/api/subadmin/machinery/1/enable" \
  -H "Authorization: Bearer MACHINERY_SUBADMIN_JWT"

# Worker
curl -X PUT "http://localhost:8080/api/subadmin/worker/1/enable" \
  -H "Authorization: Bearer WORKER_SUBADMIN_JWT"
```

---

## 📊 Workflow Diagrams

### Typical Farmer Flow
```
1. SuperAdmin creates Farmer Sub-Admin
   ↓
2. Farmer Sub-Admin registers Farmer
   ↓
3. Farmer appears in pending queue
   ↓
4. Farmer Sub-Admin reviews and approves
   ↓
5. Farmer becomes active
```

### Typical Machinery Owner Flow
```
1. SuperAdmin creates Machinery Owner Sub-Admin
   ↓
2. Machinery Sub-Admin registers Owner
   ↓
3. Owner appears in pending queue
   ↓
4. Machinery Sub-Admin approves Owner
   ↓
5. Owner uploads Machinery
   ↓
6. Machinery appears in pending listings
   ↓
7. Machinery Sub-Admin approves Machinery
   ↓
8. Machinery becomes available
```

### Typical Worker Flow
```
1. SuperAdmin creates Worker Sub-Admin
   ↓
2. Worker Sub-Admin registers Worker
   ↓
3. Worker appears in pending queue
   ↓
4. Machinery Sub-Admin reviews and approves
   ↓
5. Worker uploads documents
   ↓
6. Worker Sub-Admin verifies documents
   ↓
7. Worker becomes active
```

---

## 🔄 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request / Invalid data |
| 401 | Unauthorized / Missing JWT |
| 403 | Forbidden / Insufficient permissions |
| 404 | Not Found |
| 500 | Server Error |

---

## ⚠️ Common Errors

### Error: "Access Denied"
- Verify JWT token is valid
- Check user has correct role
- Ensure token is not expired

### Error: "User not found"
- Verify user ID exists
- Check user role is correct

### Error: "Email already exists"
- Use unique email address
- Check database for existing email

### Error: "Invalid sub-admin role"
- Use one of: FARMER_SUBADMIN, MACHINERY_OWNER_SUBADMIN, WORKER_SUBADMIN

---

## 🗄️ Database Queries

### Get all pending farmers
```sql
SELECT * FROM users WHERE role='FARMER' AND approved=0;
```

### Get all approved machinery owners
```sql
SELECT * FROM users WHERE role='MACHINERY_OWNER' AND approved=1;
```

### Get pending machinery listings
```sql
SELECT * FROM machinery WHERE approved=0;
```

### Get all sub-admins
```sql
SELECT * FROM users WHERE role IN ('FARMER_SUBADMIN', 'MACHINERY_OWNER_SUBADMIN', 'WORKER_SUBADMIN');
```

### Count users by role
```sql
SELECT role, COUNT(*) as count FROM users GROUP BY role;
```

---

## 🔐 Security Notes

1. Change default SuperAdmin password immediately
2. Use strong passwords for all accounts
3. Store JWT tokens securely
4. Never expose JWT tokens in logs
5. Use HTTPS in production
6. Regularly audit user activities
7. Disable unused sub-admin accounts
8. Monitor failed login attempts

---

## 📱 Frontend Integration Points

### Login Flow
1. User logs in with email/password
2. Backend returns JWT token
3. Frontend stores JWT in secure storage
4. Include JWT in Authorization header for subsequent requests

### Admin Dashboard
- Display pending registrations
- Show approval statistics
- List approved users by role
- Enable/disable user management
- Document verification interface

### Forms Needed
- Create Sub-Admin form
- Register User form (Farmer/Owner/Worker)
- Approval/Rejection form
- Document verification form
- Account management form

---

## 🔗 Related Files

- `API_DOCUMENTATION.md` - Complete API reference
- `IMPLEMENTATION_GUIDE.md` - Architecture details
- `DATABASE_MIGRATION.sql` - SQL setup scripts
- `IMPLEMENTATION_SUMMARY.md` - Project overview

---

## 💡 Tips & Tricks

### Get JWT Token via Login
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@krishisetu.com","password":"admin123"}'
```

### Test Endpoint Without Frontend
```bash
# Save JWT to variable
JWT="your_jwt_token_here"

# Use in requests
curl -X GET "http://localhost:8080/api/superadmin/stats" \
  -H "Authorization: Bearer $JWT"
```

### Export API Collection to Postman
All endpoints are documented in `API_DOCUMENTATION.md`

---

## 🎯 Next Steps

1. [ ] Run database migration script
2. [ ] Verify SuperAdmin user created
3. [ ] Test SuperAdmin login
4. [ ] Create first sub-admin
5. [ ] Test sub-admin operations
6. [ ] Integrate frontend forms
7. [ ] Deploy to production
8. [ ] Monitor usage statistics

---

## 📞 Troubleshooting

**Q: Getting "401 Unauthorized" on every request?**
A: JWT token is invalid or expired. Login again to get new token.

**Q: Can't approve registrations?**
A: Check if you have correct sub-admin role assigned.

**Q: Machinery listings not showing?**
A: Check if owner is approved first. Owners must be approved before they can add machinery.

**Q: Statistics showing 0 counts?**
A: Database might be empty. Check with SELECT queries.

---

**Version**: 1.0.0
**Last Updated**: January 30, 2026
**Status**: ✅ Production Ready
