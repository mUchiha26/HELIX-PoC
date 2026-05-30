# HELIX REST API Reference

<!-- F-08: Complete API surface including all missing routes -->

Base URL: `http://localhost/HELIX/api/`

All authenticated endpoints require a valid PHP session cookie (`PHPSESSID`).

---

## Auth Routes (public / authenticated)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/auth/register` | No | Visitor | Create new user account (default role: learner) |
| POST | `/auth/login` | No | All | Authenticate and create session |
| POST | `/auth/logout` | Yes | All | Destroy current session |
| GET | `/auth/me` | Yes | All | Get current authenticated user info |

---

## Profile Routes (own user)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/profile` | Yes | All | Get own profile details |
| PUT | `/profile` | Yes | All | Update own profile (name, email) |
| PUT | `/profile/password` | Yes | All | Change own password |

---

## Dashboard Routes (authenticated)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/dashboard/stats` | Yes | All | Aggregate platform statistics (role-aware) |

---

## Log Routes (blue_team, admin)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/logs/upload` | Yes | blue_team, purple_team, admin | Upload and parse log file |
| GET | `/logs` | Yes | blue_team, purple_team, admin | List ingested log entries (paginated) |
| GET | `/logs/{id}` | Yes | blue_team, purple_team, admin | Get single log entry details |

---

## Alert Routes (blue_team, admin)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/alerts` | Yes | blue_team, purple_team, admin | List alerts (filterable by severity, status) |
| GET | `/alerts/{id}` | Yes | blue_team, purple_team, admin | Get single alert with details |
| PUT | `/alerts/{id}/status` | Yes | blue_team, purple_team, admin | Update alert status (open/investigating/resolved) |

---

## Scanner Routes (red_team, admin)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/scanner/run` | Yes | red_team, purple_team, admin | Execute network scan (nmap) |
| GET | `/scanner/history` | Yes | red_team, purple_team, admin | List past scan results |
| GET | `/scanner/{id}` | Yes | red_team, purple_team, admin | Get single scan result details |

---

## AI Routes (authenticated)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/ai/chat` | Yes | All | Send message to AI assistant |
| GET | `/ai/history` | Yes | All | Load chat conversation history |

---

## Learner Routes (learner, admin)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/learner/materials` | Yes | learner, admin | List available learning materials |
| GET | `/learner/progress` | Yes | learner, admin | Get learner progress summary |
| GET | `/learner/notes` | Yes | learner, admin | List personal notes |
| POST | `/learner/notes` | Yes | learner, admin | Create a new personal note |
| PUT | `/learner/notes/{id}` | Yes | learner, admin | Update a personal note |
| DELETE | `/learner/notes/{id}` | Yes | learner, admin | Delete a personal note |

---

## Admin Routes (admin only)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/users` | Yes | admin | List all users with pagination |
| GET | `/users/stats` | Yes | admin | User statistics (total, by role) |
| GET | `/users/{id}` | Yes | admin | Get single user details |
| PUT | `/users/{id}/role` | Yes | admin | Change user role |
| POST | `/users/{id}/toggle` | Yes | admin | Enable/disable user account |
| DELETE | `/users/{id}` | Yes | admin | Delete user (cannot delete administrators) |

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (async operation queued) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no session) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |
| 503 | Service Unavailable |
