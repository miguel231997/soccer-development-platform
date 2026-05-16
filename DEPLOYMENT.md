# Railway Deployment Guide

## Overview

The backend is a Spring Boot 3.3.5 / Java 17 application. It deploys as a Docker container on Railway using the `prod` Spring profile, which requires all secrets to be supplied via environment variables (no hardcoded fallbacks).

---

## Backend — Railway setup

### 1. Create a new Railway project

1. Go to [railway.app](https://railway.app) and create a new project.
2. Add a **PostgreSQL** service — Railway provisions it and injects connection variables automatically.
3. Add a second service from your GitHub repo (or deploy via CLI) pointing to the `backend/` directory.

### 2. Required environment variables

Set these in the backend service's **Variables** tab:

| Variable | Description | Where to get it |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection URL | Auto-injected by Railway's PostgreSQL service |
| `PGUSER` | Database user | Auto-injected by Railway's PostgreSQL service |
| `PGPASSWORD` | Database password | Auto-injected by Railway's PostgreSQL service |
| `JWT_SECRET` | Base64-encoded secret, min 32 bytes | Generate: `openssl rand -base64 32` |
| `FRONTEND_URL` | Frontend origin for CORS | Your deployed frontend URL (e.g. `https://pitchiq.up.railway.app`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary dashboard |

> **Note:** When you link a Railway PostgreSQL service to your backend service, Railway auto-injects `DATABASE_URL`, `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, and `PGDATABASE`. You only need to manually set `JWT_SECRET`, `FRONTEND_URL`, and the three Cloudinary vars. The production config prepends `jdbc:` to `DATABASE_URL` automatically.

### 3. Root directory

In the Railway service settings, set **Root Directory** to `backend`.

Railway will detect the `Dockerfile` and build from there. The `prod` Spring profile activates automatically via the `ENTRYPOINT` in the Dockerfile.

### 4. Port

Railway injects a `PORT` environment variable. The `application-prod.yml` reads `${PORT:8080}` so no manual port configuration is needed.

### 5. Health check

Railway can use `GET /api/health` as the health check endpoint (it is permit-all in SecurityConfig).

---

## Frontend — Railway / Vercel / Netlify setup

The frontend is a Vite + React SPA. Build output is in `frontend/dist/`.

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (e.g. `https://soccer-api.up.railway.app`) |

### Build settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `frontend` |

---

## Generating a JWT secret

```bash
openssl rand -base64 32
```

The output is a valid base64-encoded secret. Paste it directly as `JWT_SECRET`.

---

## Local development

See [LOCAL_DEV.md](LOCAL_DEV.md) for local setup, test credentials, and seeded data.
