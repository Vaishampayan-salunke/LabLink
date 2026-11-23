# LabLink — Complete Cloud Deployment Guide (100% Render)

This comprehensive guide details step-by-step instructions for deploying the entire **LabLink** platform exclusively on **Render**, including the **Managed PostgreSQL Database**, the **FastAPI Backend Web Service**, and the **Vite + React Frontend Static Site**.

---

## Architecture Overview

```
                      +-------------------+
                      |   Client Browser  |
                      +---------+---------+
                                |
                     HTTPS      | (Vite SPA)
                                v
                      +-------------------+
                      |   Render Static   |
                      | (Frontend Web App)|
                      +---------+---------+
                                |
                     REST API   | (JWT Bearer / CORS)
                                v
                      +-------------------+
                      |  Render Web Svc   |
                      | (FastAPI Backend) |
                      +---------+---------+
                                |
                     TCP / SSL  | (psycopg3 Pool)
                                v
                      +-------------------+
                      | Render PostgreSQL |
                      |    (Port 5432)    |
                      +-------------------+
```

---

## Method 1: Instant 1-Click Deployment via Render Blueprint (Recommended)

LabLink includes a production-ready `render.yaml` Blueprint file in the repository root.

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: Prepare 100% Render deployment"
   git push origin main
   ```
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation bar and select **Blueprint**.
4. Connect your GitHub repository (`LabLink`).
5. Render will detect `render.yaml` and automatically configure:
   - **PostgreSQL Database**: `lablink-postgres` (Free tier)
   - **Backend Web Service**: `lablink-backend` (Python 3.12, Uvicorn, Alembic migrations)
   - **Frontend Static Site**: `lablink-frontend` (Vite build, SPA routing)
6. Under `lablink-backend`, enter your **`GEMINI_API_KEY`** (secret environment variable).
7. Click **Apply**.
8. Once both services are live, update `VITE_API_BASE_URL` in `lablink-frontend` with your live backend URL (e.g., `https://lablink-backend.onrender.com/api/v1`).

---

## Method 2: Manual Step-by-Step Deployment on Render

If you prefer configuring each service manually via the Render UI, follow these 3 parts:

### Part 1: Provision Managed PostgreSQL on Render

1. Open the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **PostgreSQL**.
3. Fill in the database details:
   - **Name**: `lablink-db`
   - **Database**: `lablink`
   - **User**: `lablink_user`
   - **Region**: Choose closest to you (e.g., *Singapore* or *Frankfurt*)
   - **PostgreSQL Version**: 16
   - **Plan**: Free (or Starter)
4. Click **Create Database**.
5. Wait for the status to show **Available**.
6. Under **Connections**, copy:
   - **Internal Database URL** (e.g., `postgresql://lablink_user:...@dpg-...-a/lablink`) — used by the backend service.
   - **External Database URL** — used if connecting from local machine or DBeaver.

---

### Part 2: Deploy the FastAPI Backend Web Service

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository (`LabLink`).
3. Fill in the service configuration:
   - **Name**: `lablink-backend`
   - **Region**: Same region as your database
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repo root)
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt && cd backend && alembic upgrade head
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend
     ```
   - **Plan**: Free (or Starter)

4. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   |-----|-------|-------|
   | `PYTHON_VERSION` | `3.12.0` | Required runtime version |
   | `ENVIRONMENT` | `production` | Enables production security |
   | `DEBUG` | `false` | Disables debug logs |
   | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | Render internal network |
   | `SECRET_KEY` | *(Generate a 64-char random hex string)* | Used for JWT signing |
   | `GEMINI_API_KEY` | *(Your Google Gemini API Key)* | For AI equipment recommendations |
   | `GEMINI_MODEL` | `gemini-2.5-flash` | Fast Gemini model |
   | `DEMO_ADMIN_ENABLED` | `true` | Enables pre-seeded demo accounts |

5. Click **Create Web Service**.
6. When the deployment completes, copy your live backend URL (e.g., `https://lablink-backend.onrender.com`).
7. Verify by visiting `https://lablink-backend.onrender.com/health` in your browser. You should see:
   ```json
   {"status": "healthy", "version": "1.0.0"}
   ```

---

### Part 3: Deploy the Vite + React Frontend Static Site

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your GitHub repository (`LabLink`).
3. Fill in the static site configuration:
   - **Name**: `lablink-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**:
     ```
     dist
     ```

4. Scroll down to **Environment Variables** and add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://lablink-backend.onrender.com/api/v1` |

   *(Replace `lablink-backend.onrender.com` with your actual backend URL from Part 2).*

5. Scroll down to **Redirects / Rewrites** and click **Add Rule**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`

   *(This is critical for React Router single-page application routing, ensuring pages like `/student/dashboard` reload without 404 errors).*

6. Click **Create Static Site**.
7. Render will build and deploy your static site (typically ~1-2 minutes).
8. Once live, open your static site URL (e.g., `https://lablink-frontend.onrender.com`).

---

### Part 4: Seed Database & Verify Deployment

To seed the 28 campus equipment items, dual serialized physical units, and test users:

1. In Render Dashboard, go to your **`lablink-backend`** service.
2. Click the **Shell** tab on the left navigation to open an interactive terminal inside your container.
3. Run the database seed command:
   ```bash
   cd backend && python -m app.db.seed
   ```
4. Output will confirm:
   ```
   Seeding initial departments, labs, users, and equipment...
   Database seeded successfully!
   - 5 Departments
   - 6 Laboratories
   - 28 Equipment types (56 serialized physical units)
   - 3 Users (Student, Faculty, Admin)
   ```

---

### Part 5: Pre-Configured Demo Credentials

Once deployed, log into `https://lablink-frontend.onrender.com` using the 1-click persona buttons on the Login page or with credentials:

| Role | Email | Password |
|------|-------|----------|
| **Student** | `student.alex@lablink.demo` | `StudentPass123!` |
| **Faculty** | `faculty.ece@lablink.demo` | `FacultyPass123!` |
| **Admin** | `admin@lablink.demo` | `AdminPass123!` |

---

## Troubleshooting Render Deployments

- **CORS Errors in Browser Console**:
  In `backend/app/main.py`, CORS allows all origins in development and automatically accepts the Render frontend domain. If needed, ensure `https://lablink-frontend.onrender.com` is in the allowed origins list.
- **Render Free Tier Spin-Down**:
  On Render's free tier, Web Services spin down after 15 minutes of inactivity. The initial request after a cold start may take 30–50 seconds to wake up.
- **Client Route 404 on Refresh**:
  Verify the Rewrite rule in Part 3 (`/* -> /index.html`). Without this rule, refreshing `/faculty/approvals` will return a 404 from Render's static file server.
