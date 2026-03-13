# Workspace

## Overview

CarMaint Pro (صيانة سيارتي) — An Arabic RTL SaaS web application for car maintenance tracking, built with React + Vite frontend and Express backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, Tailwind CSS, Shadcn UI, Wouter routing, Framer Motion
- **API framework**: Express 5
- **Auth + Database**: Supabase (JS client only — `@supabase/supabase-js`) — NO local PostgreSQL
- **Fonts**: Cairo (Arabic), Montserrat (English/numbers)
- **PWA**: vite-plugin-pwa, manifest.json, Web Push (VAPID)

## Color Palette

- Background: #0F172A (Deep Navy Blue)
- Card Background: #1E293B (Slate-800)
- Primary: #F97316 (Vibrant Orange)
- Secondary: #38BDF8 (Sky Blue)
- Good/Success: #10B981 (Emerald Green)
- Warning: #F59E0B (Amber Yellow)
- Overdue/Error: #EF4444 (Crimson Red)

## Data Architecture

**Supabase = Auth JWT + ALL data storage** (via JS client only)
- Supabase project: `lmkutuybfpglfkfxiwns`
- Tables: `users`, `cars`, `announcements`, `driver_reports`, `push_subscriptions`, `notification_log`
- **No local PostgreSQL** — Replit blocks outbound PostgreSQL connections to external hosts
- **No Drizzle ORM** at runtime — `lib/db/src/index.ts` exports schema types only
- Run `supabase-tables.sql` in Supabase SQL Editor to create all tables

### Request Flow
1. User logs in with Supabase → gets JWT access token
2. Frontend injects JWT into all API requests via `src/lib/api.ts`
3. Vite dev server proxies `/api/*` → API server (port 8080)
4. API server validates JWT via `requireAuth` middleware (`supabaseAdmin.auth.getUser(token)`)
5. On first login: user auto-created in Supabase `users` table via `/api/auth/me`
6. All data operations use `supabaseAdmin.from("table_name")...`

### Key Security Files
- `artifacts/api-server/src/middleware/require-auth.ts` — JWT validation + admin check
- `artifacts/api-server/src/lib/supabase-admin.ts` — Supabase admin client (service role)
- `artifacts/carmaint-pro/src/lib/api.ts` — Frontend API client (auto-injects JWT)
- `artifacts/carmaint-pro/src/hooks/use-auth.tsx` — Auth context

## Architecture

- **Frontend** (`artifacts/carmaint-pro`): React SPA, RTL Arabic, Cairo+Montserrat fonts, runs on dynamic PORT
- **Backend** (`artifacts/api-server`): Express REST API, Supabase JS client, runs on port 8080
- **Supabase**: `lmkutuybfpglfkfxiwns` — Auth + All data via service role key
- **Vite Proxy**: `${BASE_PATH}/api/*` → `http://localhost:8080/api/*` (vite.config.ts)

## Supabase Setup (REQUIRED)

Run `supabase-tables.sql` in the Supabase SQL Editor:
https://supabase.com/dashboard/project/lmkutuybfpglfkfxiwns/sql/new

Creates: `users`, `cars`, `announcements`, `driver_reports`, `push_subscriptions`, `notification_log`

## API Routes

All routes require JWT auth except `GET /api/announcements` (public):

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/auth/me | JWT | Get/sync user profile |
| PATCH | /api/auth/profile | JWT | Update name/role |
| GET | /api/cars | JWT | List user's cars |
| POST | /api/cars | JWT | Create car + mark onboarding done |
| GET | /api/cars/:id | JWT | Get car detail |
| PUT | /api/cars/:id | JWT | Update car |
| POST | /api/cars/:id/invite-driver | JWT | Invite driver to car |
| GET | /api/announcements | Public | List announcements |
| POST | /api/announcements | Admin | Create announcement |
| PUT | /api/announcements/:id | Admin | Update announcement |
| DELETE | /api/announcements/:id | Admin | Delete announcement |
| GET | /api/users | Admin | List all users |
| PATCH | /api/users/:id | Admin | Update user role/plan |
| PATCH | /api/users/onboarding-complete | JWT | Mark onboarding done |
| GET | /api/driver-reports | JWT | List driver reports |
| POST | /api/driver-reports | JWT | Submit driver report |
| GET | /api/notifications/vapid-key | Public | Get VAPID public key |
| POST | /api/notifications/subscribe | JWT | Subscribe to push |
| POST | /api/notifications/unsubscribe | JWT | Unsubscribe from push |
| POST | /api/notifications/send-user | JWT | Send push to specific user |
| GET | /api/notifications/status/:userId | JWT | Check subscription status |

## Key Frontend Files

### Pages
- `src/pages/Landing.tsx` — Public marketing page
- `src/pages/Login.tsx` — Supabase auth login
- `src/pages/Register.tsx` — Supabase auth registration + role selection
- `src/pages/Dashboard.tsx` — Fleet dashboard (manager/driver views)
- `src/pages/Admin.tsx` — Admin panel (users, announcements, cars)
- `src/pages/Onboarding.tsx` — 4-step car setup wizard
- `src/pages/Pricing.tsx` — Plan comparison

### Hooks & Utilities
- `src/hooks/use-auth.tsx` — Auth context: Supabase for auth ops, `/api/auth/me` for profile
- `src/lib/api.ts` — Authenticated API client (injects Supabase JWT automatically)
- `src/lib/supabase.ts` — Supabase client (auth only)
- `src/hooks/use-notifications.tsx` — Push notification subscription management

## Role System

| Role | Access |
|------|--------|
| admin | Full admin panel + all features |
| manager | Fleet dashboard, add cars, invite drivers |
| driver | View assigned cars + submit reports |
| both | Tabbed dashboard (manager tab + driver tab) |

## Plans

| Plan | Description |
|------|-------------|
| free | 1 car, basic features |
| pro | Up to 5 cars, all features |
| family_small | Up to 10 cars, multi-driver |
| family_large | Unlimited cars, priority support |

## Push Notifications

- VAPID keys in env vars: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`
- Service Worker: `public/sw.js`
- Scheduler: weekly Sunday 9AM KSA, daily 8AM maintenance check, daily 10AM follow-up

## Environment Variables

| Key | Purpose |
|-----|---------|
| VITE_SUPABASE_URL | Supabase project URL (frontend) |
| VITE_SUPABASE_ANON_KEY | Supabase anon/public key (frontend) |
| SUPABASE_URL | Supabase URL (backend) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin key (backend only) |
| PORT | Dev server port (managed by Replit) |
| BASE_PATH | Frontend base URL path |
| VAPID_PUBLIC_KEY | Web Push VAPID public key |
| VAPID_PRIVATE_KEY | Web Push VAPID private key |
| VAPID_EMAIL | Web Push contact email |
| VITE_VAPID_PUBLIC_KEY | VAPID public key exposed to frontend |

## PWA

- Manifest at `public/manifest.json`
- Icons: `public/icons/icon-192.png` and `public/icons/icon-512.png`
- Install prompt handles Android (beforeinstallprompt) and iOS instructions
