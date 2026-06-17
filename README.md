# Appa & Amma's Pickles

> *"From Our Village Kitchen To Your Dining Table"*

A production-ready full-stack e-commerce application for a homemade pickle business, featuring a Next.js 15 storefront and a Spring Boot 3 / Java 17 backend.

## Architecture

```
pickle-shopping/
├── backend/          # Spring Boot 3 + Java 17 + Gradle + MySQL 8
├── frontend/         # Next.js 15 + React 19 + Tailwind CSS
└── README.md
```

**Backend** follows a strict layered architecture: Controller → Service → Repository → Entity, with DTOs and MapStruct mappers separating transport from persistence.

**Frontend** uses the Next.js App Router with React Server Components for SEO-friendly product catalog rendering.

## Quick Start

You need:
- **Java 17** (`java --version`)
- **Node.js 20+** (`node --version`)
- **MySQL 8** running locally on port 3306

### 1. Create the database

```sql
CREATE DATABASE appaammas_pickles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pickles'@'localhost' IDENTIFIED BY 'picklespass';
GRANT ALL ON appaammas_pickles.* TO 'pickles'@'localhost';
FLUSH PRIVILEGES;
```

Adjust the username/password and update `backend/.env` accordingly.

### 2. Backend (Spring Boot + Gradle)

```powershell
cd backend
Copy-Item .env.example .env
.\gradlew.bat bootRun
```

First run downloads dependencies (a few minutes). On success:
- API:     http://localhost:8080/api/v1
- Swagger: http://localhost:8080/swagger-ui.html
- Health:  http://localhost:8080/actuator/health

Default admin credentials (seeded by Flyway): `admin@appaammas.in` / `Admin@123` — **change immediately in production**.

### 3. Frontend (Next.js)

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Then open http://localhost:3000.


## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Java 21, Spring Boot 3, Spring Data JPA, MapStruct, Lombok |
| Database | MySQL 8 + Flyway |
| API Docs | OpenAPI 3 (springdoc) |
| Auth | JWT (HS256) |
| Container | Docker, Docker Compose |

## Features

### Public
- Product catalog with search & categories
- Product detail pages (SEO-friendly slugs)
- Customer reviews
- Contact form
- WhatsApp order button (deep links)
- Instagram integration
- Mobile-first responsive design

### Admin
- JWT-secured login
- Dashboard (stats)
- Product / Order / Customer / Review / Inventory management
- Audit logs

## API Versioning

All endpoints are versioned: `/api/v1/...`. Future breaking changes go to `/api/v2/...`.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment to a VPS, AWS, or Railway/Render.

## License

Proprietary — © Appa & Amma's Pickles.
