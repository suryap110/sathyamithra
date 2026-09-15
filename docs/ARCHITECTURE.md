# Sathyamithra — System Architecture & Technology Stack

**Sathyamithra — Honest Guide to Every Benefit You Deserve** is a production-grade civic-tech platform providing AI-powered scheme discovery, eligibility verification, document vault management, application tracking, family benefits planning, and admin operations.

---

## 1. System Architecture Diagram

```
                 ┌─────────────────────────┐      ┌──────────────────────────┐
                 │  Next.js 14 Web Portal  │      │ Expo React Native Mobile │
                 └────────────┬────────────┘      └────────────┬─────────────┘
                              │                                │
                              └────────────────┬───────────────┘
                                               │ (HTTPS / REST)
                                      ┌────────▼────────┐
                                      │  FastAPI Backend│
                                      └────────┬────────┘
                                               │
             ┌───────────────────┬─────────────┼─────────────┬──────────────────┐
             │                   │             │             │                  │
    ┌────────▼─────────┐ ┌───────▼──────┐ ┌────▼────┐ ┌──────▼───────┐ ┌────────▼───────┐
    │ PostgreSQL DB    │ │  Redis Cache │ │ Vector  │ │ Local / Cloud│ │ AI LLM RAG      │
    │ (Relational Data)│ │ (State/Sync) │ │ Store   │ │ Document Store││ Engine           │
    └──────────────────┘ └──────────────┘ └─────────┘ └──────────────┘ └────────────────┘
```

---

## 2. Technology Stack

- **Frontend Web**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui.
- **Mobile Application**: React Native, Expo SDK 50, TypeScript, React Navigation, AsyncStorage.
- **Backend API**: Python 3.10, FastAPI, Pydantic v2, SQLAlchemy (AsyncIO), Alembic.
- **Database & Cache**: PostgreSQL 15, Redis 7.
- **AI & RAG Engine**: Retrieval-Augmented Generation, SentenceTransformers / Vector Search, Guardrails.
- **DevOps & Containers**: Docker, Docker Compose, Service Worker PWA.

---

## 3. Core Subsystems

1. **Eligibility Engine**: Evaluates citizen demographic criteria against scheme eligibility rules.
2. **Recommendation Engine**: Generates weighted match scores (0-100%) and "Why You May Qualify" explanations.
3. **AI Civic Assistant**: RAG-grounded Q&A assistant with multilingual prompt support (English, Hindi, Tamil) and confidence metrics.
4. **Document Readiness Vault**: Encrypted document vault with readiness percentage calculations per scheme.
5. **Family Mode**: Combined household profile management and multi-member eligibility.
6. **Admin Control Center**: Verification workflow, freshness monitoring, source health, zero-result query analytics, and audit logging.
