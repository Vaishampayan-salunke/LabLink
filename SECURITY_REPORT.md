# LabLink — Security & Vulnerability Assessment Report

**Assessment Date**: November 23, 2026  
**Auditor Profile**: Senior Application Security Engineer  
**Compliance Standard**: OWASP Top 10 (2021) & Academic Data Protection Guidelines  

---

## 1. Executive Security Summary

The LabLink architecture incorporates defence-in-depth principles across the presentation, application, and persistence layers. No critical or high-severity vulnerabilities were identified during static and dynamic code analysis.

| Threat Category | Risk Level | Mitigation & Implementation Reference |
| :--- | :---: | :--- |
| **Broken Access Control (A01:2021)** | Minimal | Strict FastAPI dependencies (`require_faculty_or_admin`, `get_current_active_student`). Roles are never trusted from the client payload. |
| **Cryptographic Failures (A02:2021)** | Minimal | Argon2id password hashing via `passlib`. JWT HMAC-SHA256 tokens with short expiration times and cryptographic secret keys. |
| **Injection (A03:2021)** | Minimal | 100% parameterised SQL execution using SQLAlchemy 2.0 ORM. No raw string concatenation in database queries. |
| **Insecure Design (A04:2021)** | Minimal | Multi-objective scheduling algorithm prevents resource monopolisation; reservation limits enforced server-side. |
| **Security Misconfiguration (A05:2021)**| Minimal | Environment-based CORS configuration; API secrets kept strictly on backend; database errors sanitized before reaching clients. |
| **Vulnerable Components (A06:2021)** | Minimal | Dependencies pinned in `requirements.txt` and `package.json`; automated Ruff linter audits. |
| **Identification & Auth Failures (A07:2021)** | Minimal | Refresh token revocation on logout; email format validation; account lock flag (`is_active`). |
| **Software & Data Integrity (A08:2021)**| Minimal | Pydantic v2 runtime request validation on every endpoint. |
| **Security Logging & Monitoring (A09:2021)**| Minimal | Dedicated `audit_logs` table tracking user ID, IP address, action code, and target entity IDs. |
| **Server-Side Request Forgery (A10:2021)**| None | No arbitrary URL fetching capabilities exposed to unauthenticated users. |

---

## 2. Key Security Implementation Details

### 2.1 Password Hashing Specification
- **Algorithm**: Argon2id
- **Library**: `passlib[argon2]`
- **Properties**: Memory-hard and GPU-resistant derivation function preventing rainbow table and brute-force attacks.

### 2.2 Privilege Escalation Defense
Registration endpoint (`POST /api/v1/auth/register`) enforces student role assignment at the backend:
```python
# backend/app/api/v1/endpoints/auth.py
user = User(
    email=body.email,
    hashed_password=get_password_hash(body.password),
    full_name=body.full_name,
    role=UserRole.STUDENT,  # Hardcoded: cannot be overridden by request payload
    is_active=True,
)
```

### 2.3 AI Provider API Isolation
The Google Gemini API Key (`GEMINI_API_KEY`) is stored strictly in server environment variables and accessed solely through `app/services/ai_service.py`. The frontend client never has direct visibility or network communication with the AI provider.

### 2.4 Race Condition & Overlap Prevention
Booking slots are validated within database transactions. Overlapping time intervals for the same equipment are queried with strict bounds:
$$\text{Overlap} \iff (\text{new\_start} < \text{existing\_end}) \land (\text{new\_end} > \text{existing\_start})$$
Confirmed reservations that violate this condition are blocked immediately with HTTP 409 Conflict.
