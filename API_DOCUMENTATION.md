# LabLink — REST API Specification & Endpoint Catalog

**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`  
**Interactive Docs**: `/docs` (Swagger UI), `/redoc` (ReDoc)

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticate with email/password; returns JWT access + refresh tokens. |
| `POST` | `/auth/register` | Public | Register new student profile (forces `STUDENT` role on backend). |
| `POST` | `/auth/refresh` | Public | Refresh expired access token using valid refresh token. |
| `POST` | `/auth/logout` | Authenticated | Invalidate refresh session. |
| `GET` | `/auth/me` | Authenticated | Retrieve profile details of currently authenticated user. |

---

## 2. Equipment Management (`/equipment`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/equipment` | Public/Auth | List all equipment with search, department, and category filters. |
| `GET` | `/equipment/{id}` | Public/Auth | Detailed equipment profile with specifications and access policy. |
| `POST` | `/equipment` | Faculty / Admin | Create a new equipment listing. |
| `PATCH`| `/equipment/{id}` | Faculty / Admin | Update equipment details, status, or quantity. |
| `POST` | `/equipment/{id}/maintenance` | Faculty / Admin | Schedule maintenance downtime. |
| `GET` | `/equipment/{id}/units` | Authenticated | List all physical units with QR serial identifiers. |

---

## 3. Reservations & Scheduling (`/bookings`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/bookings` | Student / Admin | Request equipment booking slot. Auto-confirms if unrestricted. |
| `GET` | `/bookings/my` | Student | List active and historical reservations for logged-in student. |
| `DELETE`| `/bookings/{id}` | Student / Admin | Cancel pending or confirmed booking prior to start time. |
| `GET` | `/bookings/recommendations` | Student / Admin | Query multi-objective ranked scheduling suggestions. |

---

## 4. Faculty Approvals (`/approvals`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/approvals/pending` | Faculty / Admin | List pending reservation requests within faculty department. |
| `POST` | `/approvals/{id}/approve` | Faculty / Admin | Approve restricted equipment reservation. |
| `POST` | `/approvals/{id}/reject` | Faculty / Admin | Reject reservation with required audit justification. |

---

## 5. GenAI Assistant (`/ai`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/project-analyze` | Student / Admin | Analyze project text via Gemini structured JSON output. |
| `POST` | `/ai/equipment-recommend`| Student / Admin | Server-side RAG equipment matching against real catalogue. |
| `POST` | `/ai/chat` | Student / Admin | Natural language lab guidance chat with semantic fallback. |

---

## 6. Projects & Waitlist (`/projects`, `/waitlist`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/projects` | Student / Admin | Create new research project and add collaborators. |
| `GET` | `/projects` | Authenticated | List user's associated projects. |
| `POST` | `/waitlist` | Student | Join waitlist queue for oversubscribed equipment. |
| `GET` | `/waitlist/my` | Student | View current waitlist positions and active offers. |
| `DELETE`| `/waitlist/{id}` | Student | Leave waitlist queue. |

---

## 7. QR Logistics & Fault Reports (`/qr`, `/fault-reports`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/qr/check-in` | Student | Check in physical equipment item by scanning unit serial. |
| `POST` | `/qr/check-out` | Student | Return physical equipment with optional condition notes. |
| `POST` | `/equipment/{id}/fault-reports` | Authenticated | Submit fault or damage report with severity ranking. |
| `GET` | `/equipment/{id}/fault-reports` | Authenticated | List fault reports for an equipment item. |
| `PATCH`| `/fault-reports/{id}` | Faculty / Admin | Triage or mark fault report as resolved. |

---

## 8. Analytics & Admin (`/analytics`, `/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/student` | Student | Aggregate student usage metrics and upcoming slots. |
| `GET` | `/analytics/faculty` | Faculty | Departmental utilization rates and pending queue count. |
| `GET` | `/analytics/admin` | Admin | Campus-wide utilization, monthly trends, category charts. |
| `GET` | `/analytics/export/csv` | Admin | Download all booking records as CSV spreadsheet. |
| `GET` | `/admin/users` | Admin | User directory management. |
| `PATCH`| `/admin/users/{id}` | Admin | Toggle user active status or update department assignment. |
| `GET` | `/admin/audit-logs` | Admin | System security audit trail. |
