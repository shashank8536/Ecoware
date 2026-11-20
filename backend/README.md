# EcoWare — Security and Identity Foundation (Member 3)

This module implements the **Authentication, Authorization, and Identity Foundation** for the **EcoWare** platform, ensuring that Citizen, Staff, and Municipal Administrator portals can securely identify users, issue cryptographic JSON Web Tokens (JWT), and strictly enforce Role-Based Access Control (RBAC).

---

## 🛡️ Architecture Overview

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Password Security**: `bcryptjs` (Salt factor 10)
- **Token Security**: `jsonwebtoken` (JWT with configurable 30-day expiry)
- **Security Headers**: `helmet`
- **Brute Force Defense**: `express-rate-limit` (100 auth attempts per 15 min window)
- **CORS Policy**: Restricts origin to frontend clients (`localhost:5173`, `localhost:3000`)

---

## 👥 Role Hierarchy & Access Matrix

| Role | Portal Target | Permissions |
| :--- | :--- | :--- |
| **`CITIZEN`** | `/citizen/*` | Report waste, track personal complaints, view collection schedules, leave feedback, edit personal profile. |
| **`STAFF`** | `/staff/*` | View assigned collection tasks, update task status, view route schedule, receive real-time dispatch alerts. Blocked from citizen actions. |
| **`SUPERVISOR` / `ADMIN`** | Municipal Dashboard | Provision staff accounts, oversee ward operations, resolve escalations, view analytics. |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create or review `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ecoware
JWT_SECRET=ecoware_jwt_super_secret_key_member3_2026
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Accounts
Pre-populates MongoDB with demo accounts matching the exact mock credentials used by the frontend team:
```bash
npm run seed
```

**Pre-seeded Accounts**:
- **Citizen**: `rohit.sharma@example.com` / `Password123`
- **Staff**: `rajesh.kumar@ecoware.gov.in` / `Staff@123`
- **Admin**: `admin@ecoware.gov.in` / `Admin@123`

### 4. Run the Security Server
```bash
npm start
# or for live watch mode
npm run dev
```

### 5. Run Automated Security & RBAC Tests
```bash
npm run test:auth
```

---

## 📡 API Reference

### Public Routes
* `POST /api/auth/register` — Register a new Citizen account.
* `POST /api/auth/login` — Authenticate any user (Citizen, Staff, Admin) and receive a JWT.

### Protected Routes (Requires `Authorization: Bearer <token>`)
* `GET /api/auth/me` — Retrieve the authenticated user's profile and active role.
* `PUT /api/auth/profile` — Update editable profile fields.
* `PUT /api/auth/change-password` — Change password after verifying current password.

### RBAC Enforcement Routes
* `GET /api/auth/citizen-only` — Accessible **only** with `role: 'CITIZEN'`. Returns `403 Forbidden` for Staff.
* `GET /api/auth/staff-only` — Accessible **only** with `role: 'STAFF'` / `'ADMIN'`. Returns `403 Forbidden` for Citizens.
* `POST /api/auth/staff` — Provision new staff members (Requires `ADMIN` or `SUPERVISOR` role).
