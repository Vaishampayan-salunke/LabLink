# LabLink — Containerisation & Local Docker Guide

This guide describes how to run LabLink locally or on any server using Docker and Docker Compose.

---

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS / Linux)
- Docker Compose v2.0+

---

## Quick Start (Docker Compose)

Run the complete multi-container stack (PostgreSQL + FastAPI Backend + Vite Nginx Frontend):

```bash
# Clone the repository
git clone https://github.com/Vaishampayan-salunke/LabLink.git
cd LabLink

# Start all services in the background
docker-compose up -d --build
```

### Accessing the Services
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **PostgreSQL Database**: `localhost:5432` (`lablink_user` / `lablink_secure_password_2026`)

---

## Service Breakdown

### 1. PostgreSQL Service (`db`)
- **Image**: `postgres:16-alpine`
- **Volume**: `postgres_data:/var/lib/postgresql/data` (persistent storage)
- **Healthcheck**: Verifies readiness via `pg_isready -U lablink_user`

### 2. Backend Service (`backend`)
- **Dockerfile**: Multi-stage Python 3.12-slim build
- **Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Environment**: Automatically connects to `db:5432` with auto-seeding enabled

### 3. Frontend Service (`frontend`)
- **Dockerfile**: 
  - Stage 1: Node 20 alpine builder runs `npm run build`
  - Stage 2: Nginx alpine serves the compiled SPA assets and proxies `/api/` to `backend:8000`

---

## Useful Docker Commands

```bash
# View live logs
docker-compose logs -f

# Check container health status
docker-compose ps

# Stop all containers
docker-compose down

# Stop and wipe persistent database volume
docker-compose down -v

# Run Alembic migrations inside container
docker-compose exec backend alembic upgrade head

# Re-run seed script inside container
docker-compose exec backend python app/db/seed.py
```
