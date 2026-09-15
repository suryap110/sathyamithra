# Sathyamithra — Production Deployment Guide

This guide outlines deployment procedures for **Sathyamithra** across Docker Compose, managed cloud hosting (Render/Vercel/EAS), and PostgreSQL database setup.

---

## 1. Environment Configuration

Copy `.env.example` to `.env` in `backend/` and `web/`:

```env
# Backend (.env)
PROJECT_NAME="Sathyamithra"
VERSION="1.0.0"
API_V1_STR="/api"
SECRET_KEY="your-production-super-secret-key-change-in-prod"
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/sathyamithra"
REDIS_URL="redis://localhost:6379/0"
CORS_ORIGINS=["http://localhost:3000", "https://sathyamithra.gov.in"]

# Mobile (.env)
EXPO_PUBLIC_API_URL="http://10.0.2.2:8000/api"
```

---

## 2. Local Docker Stack Deployment

```bash
# 1. Build and launch all services (web, backend, postgres, redis)
docker-compose up --build -d

# 2. Verify status
docker-compose ps

# 3. View backend logs
docker-compose logs -f backend
```

---

## 3. Production Cloud Hosting Strategy

- **Web Frontend**: Deploy Next.js repository to **Vercel** or **AWS Amplify** (`npm run build`).
- **FastAPI Backend**: Deploy to **Render**, **Fly.io**, or **AWS ECS** container service.
- **Database**: Provision **Managed PostgreSQL** (Supabase / AWS RDS / Render Postgres).
- **Redis**: Provision **Managed Redis** (Upstash / Redis Cloud).
- **Mobile**: Build standalone APK / IPA via **Expo Application Services (EAS)**:
  ```bash
  cd mobile
  eas build --platform android --profile production
  ```
