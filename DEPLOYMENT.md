# LabLink — Cloud Deployment Guide (Vercel + Render)

This guide provides step-by-step instructions for deploying LabLink to **Render** (Backend API + Managed PostgreSQL) and **Vercel** (Frontend SPA).

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
                      |   Vercel Edge     |
                      | (Frontend Static) |
                      +---------+---------+
                                |
                     REST API   | (JWT Bearer)
                                v
                      +-------------------+
                      |  Render Web Svc   |
                      | (FastAPI Backend) |
                      +---------+---------+
                                |
                     TCP / SSL  | (psycopg3)
                                v
                      +-------------------+
                      | Render PostgreSQL |
                      |    (Port 5432)    |
                      +-------------------+
```

---

## Part 1: Backend Deployment on Render

### Step 1: Create PostgreSQL Database on Render
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **PostgreSQL**.
3. Set the database name to `lablink_db`.
4. Choose the Free/Starter instance tier.
5. Copy the **Internal Database URL** and **External Database URL**.

### Step 2: Deploy Web Service on Render
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/Vaishampayan-salunke/LabLink.git`.
3. Configure the build parameters:
   - **Environment**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables:
   - `ENVIRONMENT`: `production`
   - `DEBUG`: `false`
   - `DATABASE_URL`: `<Your-Render-PostgreSQL-Connection-String>`
   - `SECRET_KEY`: `<Generate-a-secure-32-char-random-string>`
   - `GEMINI_API_KEY`: `<Your-Google-Gemini-API-Key>`
   - `DEMO_ADMIN_ENABLED`: `true` (for hackathon evaluation)
   - `CORS_ORIGINS`: `["https://lablink.vercel.app", "http://localhost:5173"]`

### Step 3: Verify Backend Health
Once deployed, test the health check endpoint:
```bash
curl https://<your-render-service>.onrender.com/health
# Response: {"status":"online","service":"LabLink API","database":"healthy"}
```

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Import Project to Vercel
1. Log into [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Vaishampayan-salunke/LabLink`.
4. Set the **Root Directory** to `frontend`.
5. Select Framework Preset: **Vite**.

### Step 2: Configure Build Settings & Environment
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://<your-render-service>.onrender.com/api/v1`

### Step 3: Deploy and Test
1. Click **Deploy**.
2. Vercel will build the frontend assets using Vite and distribute them to global CDN edges.
3. Access the deployed application at `https://<your-project>.vercel.app`.

---

## Part 3: Database Seeding in Production

To seed the 28 realistic equipment items and demo accounts in production:
1. Open the Render Shell tab in your web service dashboard.
2. Run the seed script:
```bash
PYTHONPATH=. python app/db/seed.py
```
This populates all 5 departments, 6 laboratories, 28 equipment units, access rules, and demo accounts.
