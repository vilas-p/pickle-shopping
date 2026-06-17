# Backend — Appa & Amma's Pickles

Spring Boot 3 + Java 17 + Gradle backend providing REST APIs for the storefront and admin console.

## Quick Start

```powershell
Copy-Item .env.example .env
# Make sure MySQL is running and the `appaammas_pickles` database exists
.\gradlew.bat bootRun
# Swagger UI: http://localhost:8080/swagger-ui.html
```

## Default admin login

Seeded on first startup (override via env vars `app.bootstrap.admin-email` / `app.bootstrap.admin-password`):
- email: `admin@appaammas.in`
- password: `Admin@123` ← **change this immediately in any real environment**

## Endpoint Map (selected)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/api/v1/auth/login` | public | Returns JWT |
| `GET`  | `/api/v1/products` | public | Paginated list with `search`, `category`, `featured` |
| `GET`  | `/api/v1/products/featured` | public | Bestsellers |
| `GET`  | `/api/v1/products/slug/{slug}` | public | Detail by SEO slug |
| `POST` | `/api/v1/products` | ADMIN | Create product |
| `GET`  | `/api/v1/categories` | public | List active |
| `POST` | `/api/v1/orders` | public | Place order |
| `GET`  | `/api/v1/orders/number/{n}` | public | Order receipt |
| `GET`  | `/api/v1/orders` | STAFF/ADMIN | Admin list |
| `PATCH`| `/api/v1/orders/{id}/status` | STAFF/ADMIN | Update status |
| `POST` | `/api/v1/reviews` | public | Submit (moderated) |
| `GET`  | `/api/v1/reviews/latest` | public | Homepage |
| `POST` | `/api/v1/contacts` | public | Contact form |
| `GET`  | `/api/v1/customers` | STAFF/ADMIN | Search customers |
| `GET`  | `/api/v1/inventory` | STAFF/ADMIN | List stock |
| `GET`  | `/api/v1/admin/dashboard/stats` | STAFF/ADMIN | Aggregated metrics |

Full docs: `/swagger-ui.html`

## Build

```powershell
.\gradlew.bat clean bootJar
java -jar build\libs\pickles-backend.jar
```

## Tests

```powershell
.\gradlew.bat test
```

## Useful Gradle tasks

| Task | Purpose |
|------|---------|
| `bootRun` | Run the app with hot Spring Boot conventions |
| `bootJar` | Build the executable fat JAR into `build/libs/` |
| `test` | Run unit tests |
| `clean` | Wipe build outputs |
| `dependencies` | Print the dependency tree |

