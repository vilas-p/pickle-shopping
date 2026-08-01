# Deployment Guide

This guide covers deploying **Appa & Amma's Pickles** to production.

## Architecture Overview

```
[ Cloudflare / DNS ] -> [ Frontend (Next.js) ] -> [ Backend (Spring Boot) ] -> [ MySQL 8 ]
                                                       |
                                                       └─> Swagger UI / Actuator
```

Recommended split:
- **Frontend** on Vercel or any Node host
- **Backend** on a VPS (Hetzner, DigitalOcean), Railway, Render, or Fly.io
- **Database** on a managed MySQL (PlanetScale, AWS RDS, DigitalOcean Managed DB)

## 1. Prerequisites

- A domain (e.g. `appaammas.in`)
- A managed MySQL 8 database
- (Optional) S3-compatible bucket or Cloudinary for product images
- A registered WhatsApp Business number
- An Instagram business account

## 2. Production environment variables

### Backend (`.env` or platform env vars)

```env
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:3306/appaammas_pickles?useSSL=true&serverTimezone=Asia/Kolkata
SPRING_DATASOURCE_USERNAME=<db-user>
SPRING_DATASOURCE_PASSWORD=<strong-password>

# Generate a 64-char random string. NEVER use the default in prod.
APP_JWT_SECRET=<at-least-32-chars-random-string>
APP_JWT_EXPIRATION_MS=86400000

APP_CORS_ALLOWED_ORIGINS=https://appaammas.in
```

### Frontend (`.env.production`)

```env
NEXT_PUBLIC_API_BASE_URL=https://api.appaammas.in/api/v1
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_INSTAGRAM_HANDLE=appaammas.pickles
NEXT_PUBLIC_SITE_URL=https://appaammas.in
```

## 3. Database setup

The backend uses Flyway migrations, so the schema and seed data are applied automatically on first startup. Just ensure:
- The DB exists (e.g. `CREATE DATABASE appaammas_pickles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
- The DB user has `ALTER, CREATE, DELETE, INDEX, INSERT, SELECT, UPDATE, REFERENCES` privileges

## 4. Deploying the backend

### Option A: Docker (recommended on a VPS)

```bash
docker build -t pickles-backend ./backend
docker run -d --name pickles-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file ./backend/.env \
  pickles-backend
```

### Option B: Railway / Render / Fly.io

1. Connect the `backend/` folder
2. Use the included `Dockerfile`
3. Set the environment variables above
4. Configure a managed MySQL plugin and inject `SPRING_DATASOURCE_URL` etc.

### Option C: Bare metal

```powershell
cd backend
.\gradlew.bat clean bootJar
java -jar build\libs\pickles-backend.jar --spring.profiles.active=prod
```

## 5. Deploying the frontend (Vercel)

1. Push the repo to GitHub
2. On [vercel.com](https://vercel.com), import the project; set **Root Directory** to `frontend/`
3. Add the production env vars listed above
4. Deploy

## 6. Domain & SSL

Point `appaammas.in` to the frontend host (Vercel) and `api.appaammas.in` to the backend host. Issue Let's Encrypt certs (Vercel/Render do this automatically). Behind a VPS, use Caddy or Nginx + Certbot.

Example Nginx site for the backend:

```nginx
server {
    listen 443 ssl http2;
    server_name api.appaammas.in;

    ssl_certificate     /etc/letsencrypt/live/api.appaammas.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.appaammas.in/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

## 7. Post-deploy checklist

- [ ] Change the default admin password (`admin@appaammas.in` / `Admin@123`) immediately
- [ ] Verify `/swagger-ui.html` is reachable and document is accurate
- [ ] Replace placeholder product images with real photographs
- [ ] Verify CORS — frontend origin matches `APP_CORS_ALLOWED_ORIGINS`
- [ ] Test order placement end-to-end
- [ ] Test WhatsApp deep links from a real phone
- [ ] Confirm sitemap.xml and robots.txt
- [ ] Configure backups for the MySQL database
- [ ] Monitor `/actuator/health`

## 8. Day-2 operations

### Reset admin password (if locked out)

```sql
UPDATE users SET password_hash = '$2a$10$<bcrypt-hash>' WHERE email = 'admin@appaammas.in';
```

Generate a hash with:

```bash
htpasswd -bnBC 10 "" "<new-password>" | tr -d ':\n' | sed 's/^\$2y/\$2a/'
```

### Logs

```bash
docker logs -f pickles-backend
```

### Database backup

```bash
mysqldump -h <host> -u <user> -p appaammas_pickles | gzip > backup-$(date +%F).sql.gz
```
