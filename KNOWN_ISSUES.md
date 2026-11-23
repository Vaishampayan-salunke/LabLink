# LabLink Known Issues & Remediations

1. **Docker Daemon Access in Local Sandbox**:
   - *Status*: Docker engine named pipe `npipe:////./pipe/docker_engine` is not active on this Windows development host, which prevents running `docker build` directly inside this environment.
   - *Remediation*: Full production multi-stage `Dockerfile` and `docker-compose.yml` are provided, verified for syntax, and instructions for running on any Docker-enabled host or Render/Vercel are documented in `DOCKER_GUIDE.md`.

2. **Gemini API Key in Local Offline Testing**:
   - *Status*: When running offline without an active `GEMINI_API_KEY`, AI requests could time out.
   - *Remediation*: An intelligent deterministic natural-language heuristic fallback is built into `ai_service.py` that extracts microcontrollers, sensors, computing, and test equipment and grounds them against live PostgreSQL records with zero downtime.
