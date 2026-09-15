# Sathyamithra — Honest Guide to Every Benefit You Deserve

**Sathyamithra** is a production-grade, AI-powered civic-tech platform that empowers Indian citizens to discover, verify eligibility for, and access central and state government benefits with complete transparency.

---

## 🌟 Core Value Proposition

```
Understand Me ➔ Find ➔ Explain Why ➔ Prepare ➔ Guide ➔ Track ➔ Alert ➔ Support
```

1. **Understand Me**: Progressive demographic profiling (age, state, income, category, occupation).
2. **Find**: Instant semantic discovery across Central and State government scheme databases.
3. **Explain Why**: Explainable recommendation match scores (0-100%) and "Why You May Qualify" breakdowns.
4. **Prepare**: Document Readiness Vault checking essential certificates (Aadhaar, PAN, Income, Passbook).
5. **Guide**: Step-by-step application walkthroughs and RAG-grounded AI Assistant in English, Hindi, and Tamil.
6. **Track**: Application tracking dashboard with status history timelines.
7. **Alert**: Deadline reminders, smart alerts, and push notification tokens.
8. **Support**: Hyperlocal CSC/E-Sevai center locator and moderated community Q&A.

---

## 🛠️ Technology Stack

- **Web Portal**: Next.js 14, React 18, TypeScript, Tailwind CSS, PWA Service Worker.
- **Mobile App**: React Native, Expo SDK 50, TypeScript, Offline AsyncStorage & Sync Engine.
- **Backend API**: Python 3.10, FastAPI, SQLAlchemy (AsyncIO), Pydantic v2, Alembic.
- **Database & Cache**: PostgreSQL 15, Redis 7.
- **AI & RAG Engine**: Retrieval-Augmented Generation with prompt injection defenses and grounding verification.
- **Admin Control Center**: RBAC (`ADMIN`, `CONTENT_EDITOR`, `COMMUNITY_MODERATOR`), freshness checks, zero-result query analytics, audit logs.

---

## 🚦 Quick Start Guide

### 1. Backend Server Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Web Portal Setup
```bash
cd web
npm install
npm run dev
```

### 3. Mobile App Setup
```bash
cd mobile
npm install
npm run start
```

### 4. Docker Compose Deployment
```bash
docker-compose up --build -d
```

---

## 🧪 Testing & Quality Assurance

```bash
# Backend Pytest Suite
cd backend
.\venv\Scripts\python -m pytest

# Mobile Type Check
cd mobile
npx tsc --noEmit

# Web Production Build
cd web
npm run build

# Phase 9 Comprehensive Audit
cd backend
.\venv\Scripts\python audit_phase9.py
```

---

## 📑 Documentation Index

- [Architecture Guide](file:///C:/Users/surya/.gemini/antigravity/scratch/sathyamithra/docs/ARCHITECTURE.md)
- [Security Audit & Hardening Report](file:///C:/Users/surya/.gemini/antigravity/scratch/sathyamithra/docs/SECURITY-AUDIT.md)
- [System Test Report](file:///C:/Users/surya/.gemini/antigravity/scratch/sathyamithra/docs/TEST-REPORT.md)
- [Production Checklist](file:///C:/Users/surya/.gemini/antigravity/scratch/sathyamithra/docs/PRODUCTION-CHECKLIST.md)
- [Deployment Guide](file:///C:/Users/surya/.gemini/antigravity/scratch/sathyamithra/docs/DEPLOYMENT.md)
- [Security Policy](file:///C:/Users/surya/.gemini/antigravity/scratch/sathyamithra/SECURITY.md)
