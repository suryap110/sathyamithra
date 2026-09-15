# Sathyamithra Mobile Application (Expo / React Native)

Official mobile application for **Sathyamithra — Honest Guide to Every Benefit You Deserve**.

## Architecture & Features

- **React Native + Expo (TypeScript)**: Clean component hierarchy and native navigation.
- **Bottom Tabs & Stack Navigation**:
  - `Home`: Feature hub, category quick launch, floating Sathyamithra AI button.
  - `Schemes`: Discover and filter central & state government benefits with search & local cache.
  - `Saved`: Offline bookmarked schemes with instant access.
  - `Applications`: Real-time application tracker with progress indicators.
  - `Vault`: Offline document readiness score (Aadhaar, PAN, Income Cert, Passbook).
  - `Family`: Household profile switcher & combined family scheme eligibility.
  - `AI Assistant`: Multilingual civic RAG voice & chat guide.
  - `Settings`: Elder Mode toggle, font multiplier selector, manual offline queue sync trigger, push notification token registration.

- **Offline-First Architecture**:
  - `offlineCache.ts`: AsyncStorage cache layer for scheme data and user profile.
  - `syncEngine.ts`: FIFO offline action queue that syncs with `POST /api/sync` when online connection is restored.
  - `apiClient.ts`: Axios client configured with JWT bearer authorization and automatic 401 handling (`http://10.0.2.2:8000/api` for Android emulator compatibility).

- **Accessibility & Elder Mode**:
  - `accessibilityService.ts`: Font scaling multiplier (0.9x to 1.4x) and Elder Mode toggle (high contrast, 1.35x font scaling, large touch targets).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Expo dev server
npm run start

# 3. Launch Android / iOS / Web
npm run android
npm run ios
npm run web
```
