# Railway Deployment Guide

## Overview

This guide covers deploying the **backend** (Spring Boot + MySQL) on [Railway](https://railway.app). Railway automatically injects a `PORT` environment variable that the app listens on — our configuration already respects this.

---

## Prerequisites

- A Railway account (free tier or paid)
- GitHub repository with this project pushed
- Railway CLI installed (optional but helpful): `npm i -g @railway/cli`

---

## Step 1: Create a New Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"** and select your repository

---

## Step 2: Add a MySQL Database

1. Inside your Railway project, click **"+ New"** → **"Database"** → **"MySQL"**
2. Railway will provision a MySQL instance and expose connection variables automatically:
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
   - Or a single `DATABASE_URL` (jdbc-style)
3. Note the internal hostname (e.g., `mysql.railway.internal`) — you'll use this for the backend service.

---

## Step 3: Deploy the Backend Service

### Option A: Deploy from GitHub (Recommended)

1. In your Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Set the **Root Directory** to `backend`
4. Railway will detect the Dockerfile and build automatically

### Option B: Deploy via CLI

```bash
cd backend
railway login
railway init         # or link to existing project
railway up
```

---

## Step 4: Configure Backend Environment Variables

In the backend service settings → **Variables** tab, add:

### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Use production profile |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata` | Use Railway's MySQL reference variables |
| `SPRING_DATASOURCE_USERNAME` | `${{MySQL.MYSQL_USER}}` | Railway variable reference |
| `SPRING_DATASOURCE_PASSWORD` | `${{MySQL.MYSQL_PASSWORD}}` | Railway variable reference |
| `APP_JWT_SECRET` | (generate a 64+ char random string) | For admin JWT signing |
| `APP_CUSTOMER_JWT_SECRET` | (generate a 64+ char random string) | For customer JWT signing |
| `APP_CORS_ALLOWED_ORIGINS` | `https://your-frontend-domain.up.railway.app` | Your frontend URL |

### Optional Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `APP_JWT_EXPIRATION_MS` | `86400000` | 24 hours (default) |
| `RAZORPAY_KEY_ID` | Your Razorpay key | Payment integration |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret | Payment integration |
| `RAZORPAY_WEBHOOK_SECRET` | Your webhook secret | Payment webhooks |
| `APP_NOTIFICATION_SMS_PROVIDER` | `MSG91` | SMS provider |
| `APP_NOTIFICATION_SMS_MSG91_AUTH_KEY` | Your MSG91 key | SMS auth |

### Using Railway Variable References

Railway supports referencing variables from other services. For the database URL, you can use:

```
SPRING_DATASOURCE_URL = jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
SPRING_DATASOURCE_USERNAME = ${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD = ${{MySQL.MYSQLPASSWORD}}
```

> **Note:** Railway automatically injects `PORT` — you do NOT need to set it manually. The backend is configured to read `PORT` and defaults to `8080`.

---

## Step 5: Configure Networking

1. In the backend service → **Settings** → **Networking**
2. Click **"Generate Domain"** to get a public URL (e.g., `pickles-backend-production.up.railway.app`)
3. Or add a custom domain if you have one

---

## Step 6: Health Check (Optional but Recommended)

In the service **Settings** → **Deploy** section:

- **Health Check Path:** `/actuator/health`  
- **Restart Policy:** On failure

This ensures Railway only routes traffic after the app is healthy.

---

## Step 7: Deploy Frontend (Separate Service)

1. Add another service: **"+ New"** → **"GitHub Repo"**
2. Set **Root Directory** to `frontend`
3. Add these environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.up.railway.app/api/v1` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Your WhatsApp number |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | Your Instagram handle |

---

## Deployment Checklist

- [ ] MySQL database provisioned on Railway
- [ ] Backend service linked to GitHub repo with root directory `backend`
- [ ] All required environment variables set with Railway variable references
- [ ] Backend has a public domain generated
- [ ] Frontend service deployed with correct `NEXT_PUBLIC_API_BASE_URL`
- [ ] CORS origin set to frontend's domain
- [ ] Health check configured

---

## Troubleshooting

### "Communications link failure"
The backend can't reach MySQL. Ensure:
- The MySQL service is in the same Railway project
- You're using `${{MySQL.MYSQLHOST}}` (internal hostname) not `localhost`
- The MySQL service is healthy (check its logs)

### Port Issues
Railway injects `PORT` automatically. Our app reads it via:
- `application.yml`: `server.port: ${PORT:8080}`
- `Dockerfile ENTRYPOINT`: `-Dserver.port=${PORT:-8080}`

You should **never** hardcode a port or set `PORT` manually on Railway.

### Build Failures
- Ensure the **Root Directory** is set to `backend` (not the monorepo root)
- Railway uses the Dockerfile in that directory automatically
- Check that `gradlew` has execute permissions (the Dockerfile handles this)

### Memory Issues
The default Railway hobby plan gives 512MB RAM. The Dockerfile sets `-XX:MaxRAMPercentage=75.0` which is appropriate. If you see OOM errors, upgrade your plan or reduce the percentage.

---

## Architecture on Railway

```
Railway Project
├── MySQL (Database)
│   └── Internal: mysql.railway.internal:3306
├── Backend (Service)
│   ├── Dockerfile: ./backend/Dockerfile
│   ├── Reads PORT from Railway
│   └── Public: pickles-backend.up.railway.app
└── Frontend (Service)
    ├── Dockerfile: ./frontend/Dockerfile
    ├── Reads PORT from Railway
    └── Public: pickles-frontend.up.railway.app
```

---

## Useful Railway CLI Commands

```bash
railway login                    # Authenticate
railway link                     # Link to existing project
railway up                       # Deploy current directory
railway logs                     # View service logs
railway variables                # List env vars
railway variables --set KEY=VAL  # Set a variable
railway status                   # Check deployment status
```
