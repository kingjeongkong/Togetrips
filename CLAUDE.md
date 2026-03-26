# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Active Codebase

All development happens exclusively in the `nextjs/` folder. The `frontend/` folder is a legacy Vite app — do not modify it.

## Commands

Run all commands from the `nextjs/` directory using `pnpm`:

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint check
pnpm type-check   # TypeScript check (tsc --noEmit)
pnpm test:jest    # Run Jest unit tests
pnpm test:e2e     # Run Playwright E2E tests
```

To run a single Jest test file:
```bash
pnpm test:jest -- path/to/test.test.ts
```

## Architecture Overview

Togetrips is a location-based social platform for travelers. It is a Next.js 15 App Router application backed by Supabase (PostgreSQL, Auth, Realtime, Storage) and Firebase (Cloud Messaging for push notifications). Maps use Google Maps API and Mapbox. Deployed on Vercel.

### Directory Structure (`nextjs/src/`)

```
app/
  (main)/          # Protected route group (auth-gated)
    home/          # Traveler discovery by location
    gatherings/    # Group events with real-time group chat
    chat/          # Direct and group messaging
    request/       # Travel companion requests
    profile/       # User profiles
  auth/            # Sign in / sign up / OAuth callback pages
  api/             # REST API routes (server-only)

features/{domain}/ # Domain modules: auth, chat, gatherings, home,
                   # notifications, profile, request, shared
  components/      # Domain UI components
  hooks/           # Domain-specific hooks
  services/        # Client-side services (call API routes)
  types/           # Domain-specific types
  utils/           # Domain utilities

lib/               # Server/client common logic, external service integration
  supabase-config.ts
  firebase-admin.ts / firebase-client.ts
  google-maps.ts / mapbox.ts

stores/            # Global Zustand stores (mapStore, realtimeStore)
components/        # Cross-domain reusable UI components
hooks/             # Shared custom hooks
types/             # Shared type definitions
utils/             # Pure utility functions
middleware.ts      # Auth and routing middleware
```

### Key Architectural Rules

**Server/Client separation (strict):**
- `app/api/` routes are server-only — they access the database directly via `lib/` services
- `features/` is client-only — UI components and client logic call API routes, never the database directly
- Server-only env vars (`process.env.X`) must never appear in `features/` or `components/`
- Client public env vars use `NEXT_PUBLIC_` prefix

**Dependency direction:**
```
API Routes → lib/ → External Services (Supabase, Firebase, Maps)
Features   → lib/ (common utilities only)
API Routes → Features (PROHIBITED — reverse dependency)
```

**Feature isolation:**
- `features/A/` must not import internal files from `features/B/`
- Shared logic goes in `features/shared/`, `components/`, or `lib/`

**Service pattern:**
- Server services (in `lib/` or `app/api/_utils/`): direct DB access, handle and throw errors
- Client services (in `features/{domain}/services/`): call API routes, handle and throw errors
- Service functions handle all error logic so callers don't need try-catch

## Code Style

- **Comments and TODOs**: Write in Korean
- **UI text** (buttons, labels, error messages): Write in English
- **Exports**: Use named exports for components
- **Component props**: Define a `Props` interface at the top of each component file
- **Commit prefixes**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Branch names**: `feature/name`, `fix/name`, `hotfix/name`, `refactor/name`
