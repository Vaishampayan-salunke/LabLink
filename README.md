# 🔬 LabLink — Making College Laboratories More Accessible

> **LabLink** is a production-minded, GenAI-powered campus laboratory resource-sharing platform. It eliminates institutional resource-discovery silos, resolves cross-department scheduling conflicts, automates faculty access approvals, and leverages Google Gemini to ground project hardware requirements directly into live laboratory inventories.

---

## 🌟 Key Capabilities

1. **Cross-Department Equipment Discovery**: Search, filter, and paginate through laboratory inventories across 5 departments (Computer Science, ECE, EEE, Mechanical & Robotics, Biotechnology) with live availability checks.
2. **Deterministic Scheduling Engine**: Multi-factor candidate scoring and hard constraint validation preventing overlapping reservations, maintenance violations, and over-allocation.
3. **Faculty Approval Workflows**: Transactional state transitions (`PENDING` → `CONFIRMED` / `REJECTED`) for restricted hardware with mandatory faculty rejection rationales and instant student notification dispatch.
4. **Instant Auto-Approval for Permitted Gear**: Unrestricted general-purpose equipment auto-confirms inside an atomic transaction when duration and capacity constraints are satisfied.
5. **Grounded Gemini AI Assistant**: Natural language project requirement extraction (microcontrollers, sensors, computing, testing tools) grounded strictly into live database records, preventing AI hallucinations.
6. **Persistent Notifications & Analytics**: In-app notifications and real SQL aggregate metrics for Students, Faculty Coordinators, and Administrators.

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌───────────────────────────┐
                                  │      Vercel / Browser     │
                                  │   React 18 + TypeScript   │
                                  │  Tailwind CSS + shadcn/ui │
                                  └─────────────┬─────────────┘
                                                │ REST API / JWT
                                                ▼
                                  ┌───────────────────────────┐
                                  │       Render / Docker     │
                                  │      FastAPI (Python)     │
                                  │   Deterministic Scheduler │
                                  └──────┬─────────────┬──────┘
                                         │             │
                    SQLAlchemy 2.0 / Alembic           │ Google GenAI SDK
                                         │             │
                                         ▼             ▼
                    ┌──────────────────────────┐  ┌──────────────────┐
                    │ PostgreSQL Database      │  │ Google Gemini API│
                    │  (Render / Local Docker) │  │ (Grounded Output)│
                    └──────────────────────────┘  └──────────────────┘
```

### Stack Details
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router, Recharts, Lucide React.
- **Backend**: Python 3.12 / 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, PostgreSQL (`psycopg`), JWT (`pyjwt`), Argon2id / bcrypt.
- **AI**: Google Gemini API via official `google-genai` Python SDK, with Pydantic structured output validation and deterministic database grounding.
- **Infrastructure**: Docker, Docker Compose, Vercel (Frontend), Render (Backend & PostgreSQL).

---

## 📂 Project Structure

```
Ramiah-hackthon/
├── backend/
│   ├── alembic/                 # Database migrations
│   ├── app/
│   │   ├── api/                 # REST endpoints
│   │   │   └── v1/
│   │   │       ├── endpoints/   # auth, equipment, bookings, approvals, ai, analytics, etc.
│   │   │       └── api.py
│   │   ├── core/                # config, security (Argon2id, JWT)
│   │   ├── db/                  # base, session, seed.py
│   │   ├── models/              # SQLAlchemy 2.0 models (User, Equipment, Booking, etc.)
│   │   ├── schemas/             # Pydantic v2 validation schemas
│   │   ├── services/            # scheduling, ai, notification, analytics services
│   │   └── main.py              # FastAPI app & health endpoint
│   ├── tests/                   # 24 pytest unit, integration & concurrency tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ui/       # Button, Card, Badge, Input, etc.
│   │   ├── features/auth/       # AuthContext, role guards
│   │   ├── layouts/             # DashboardLayout with role navigation
│   │   ├── pages/
│   │   │   ├── student/         # Dashboard, Catalogue, Detail, New Booking, Assistant
│   │   │   ├── faculty/         # Dashboard, Approvals, Equipment, Calendar, Analytics
│   │   │   ├── admin/           # Dashboard, Users, Departments, Bookings, Audit Logs
│   │   │   ├── LoginPage.tsx    # Portal login with persona prefill
│   │   │   └── RegisterPage.tsx
│   │   ├── services/            # API client with token rotation
│   │   └── types/               # TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml           # Full-stack composition (Frontend, Backend, PostgreSQL)
├── vercel.json                  # Vercel deployment config
├── render.yaml                  # Render infrastructure blueprint
└── README.md
```

---

## 🔑 Demo Personas & Credentials

The application opens directly on the login page. Demo credential buttons prefill the form so the user can inspect credentials and explicitly submit:

| Role | Name / Title | Email Address | Password | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Arthur Vance (Dean) | `admin@lablink.demo` | `LabLink@Demo2026` | System overview, user management, facility CRUD, audit logs |
| **Faculty Coordinator** | Prof. Elena Rostova (ECE) | `faculty.ece@lablink.demo` | `LabLink@Faculty2026` | Review pending student requests, approve/reject, schedule maintenance |
| **Student** | Alex Rivera | `student.alex@lablink.demo` | `LabLink@Student2026` | Discover equipment, reserve slots, AI project assistant, cancel bookings |

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL or SQLite (SQLite runs out-of-the-box for local testing)

### 1. Backend Setup
```bash
# 1. Navigate to backend and create virtual environment
python -m venv .venv

# 2. Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Initialize database and seed demo records
$env:PYTHONPATH="backend"
python backend/app/db/seed.py

# 5. Start development server
uvicorn app.main:app --reload --port 8000 --app-dir backend
```
- API Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

### 2. Frontend Setup
```bash
# 1. Open a new terminal and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🐳 Docker & Docker Compose

Run the entire platform (PostgreSQL database, FastAPI backend, and Nginx-served React frontend) with a single command:

```bash
docker compose up --build
```

- Web Portal: `http://localhost` (or `http://localhost:5173`)
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

---

## 🧠 Intelligent Scheduling & Deterministic Scoring Engine

LabLink implements an algorithmic conflict resolution and recommendation engine that calculates candidate feasibility:

### Hard Constraints (Must satisfy 100%):
- Equipment compatibility & single-capacity non-overlap.
- Permitted booking duration (`max_booking_hours`).
- Laboratory operating hours (09:00 - 18:00).
- Scheduled maintenance windows.
- Existing confirmed reservations.

### Normalised Weighted Heuristic (0–100):
$$\text{Score} = (0.30 \times U) + (0.25 \times A) + (0.20 \times C) + (0.15 \times F) + (0.10 \times S)$$
- **Deadline Urgency ($U$)**: 30% — Prioritizes allocations comfortably ahead of academic project deadlines.
- **Equipment Availability ($A$)**: 25% — Assesses current unit capacity and concurrent demand.
- **Requirement Compatibility ($C$)**: 20% — Evaluates technical match with project specifications.
- **Fairness ($F$)**: 15% — Penalizes excessive repeated allocations to guarantee equitable resource sharing across student bodies.
- **Schedule Suitability ($S$)**: 10% — Closeness to student's requested time slot.

---

## 🧪 Testing Suite & Verification

The project includes unit, integration, and high-concurrency race condition test suites:

```bash
# Run backend test suite
$env:PYTHONPATH="backend"
pytest backend/tests -v
```

### Test Coverage Highlights:
- **`test_auth.py`**: Token issuance, password verification, self-registration role escalation prevention (`role="ADMIN"` forced to `STUDENT`).
- **`test_equipment.py`**: Catalogue search, department filters, specification attributes, role deletion authorization.
- **`test_scheduling.py`**: Weighted heuristic score verification, hard constraint violation rejection, alternative slot generation.
- **`test_bookings.py`**: Unrestricted gear auto-confirmation, restricted gear pending flow, faculty approval transactions, rejection with mandatory reason.
- **`test_concurrency.py`**: Concurrent booking collision verification; ensures second conflicting booking attempt receives `409 Conflict`.
- **`test_ai.py`**: Project analysis extraction and grounded PostgreSQL retrieval.
- **`test_analytics.py`**: Real SQL aggregate queries for student, faculty, and administrator dashboards.

**Test Results: 24 passed (100% passing)**.

---

## 🚀 Cloud Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. In Vercel, import the repository and select the `frontend` root directory.
3. Configure Environment Variable: `VITE_API_BASE_URL=https://<your-render-backend-url>/api/v1`.
4. Deploy using standard Vite preset (handled by `vercel.json`).

### Backend (Render)
1. In Render, select **New Blueprint** and connect this repository (reads `render.yaml`).
2. Render automatically provisions:
   - A managed PostgreSQL database (`lablink-postgres`).
   - A FastAPI Python web service running database migrations (`alembic upgrade head`) and uvicorn.
3. Set your `GEMINI_API_KEY` in Render Dashboard Environment settings.

---

## 📄 License
MIT License. Built for collegiate research and laboratory accessibility.
