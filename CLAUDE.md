# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server at http://localhost:8080
bun run build        # Production build
bun run build:dev    # Dev-mode build
bun run lint         # Run ESLint
bun run preview      # Preview production build locally
```

**Always use `bun`** — not npm or yarn.

## Architecture

**Stack**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase (auth + database + edge functions), TanStack Query v5, React Router v6, React Hook Form + Zod.

**Path alias**: `@/` maps to `./src/`.

### Frontend structure

- `src/App.tsx` — Root component. Defines all routes, wraps with `QueryClientProvider`, `AuthProvider`, `TooltipProvider`. Add new routes here, above the `*` catch-all.
- `src/contexts/AuthContext.tsx` — Global Supabase auth state (`user`, `session`, `isLoading`, `signIn`, `signOut`, `signUp`). Consumed via `useAuth()`.
- `src/integrations/supabase/` — Auto-generated Supabase client (`client.ts`) and TypeScript types (`types.ts`). Do not edit manually.
- `src/pages/` — Page-level components, one per route.
- `src/components/` — Feature-organised components: `genie/`, `coach/`, `advisor/`, `founder/`, `hub/`, `ui/` (shadcn primitives).
- `src/hooks/` — Custom hooks for data fetching and feature logic (e.g. `useGenieSessions`, `useCoachCredits`, `useAdminAuth`).

### Backend (Supabase)

- `supabase/functions/` — ~60 Deno edge functions. Each function is its own directory with an `index.ts` entry point.
- `supabase/migrations/` — SQL migration files applied in order.
- `supabase/_shared/` — Shared utilities used across edge functions.

### Key product areas

| Area | Route | Notes |
|------|-------|-------|
| Genie (AI assistant) | `/genie` | Multi-mode AI chat, voice interface, leaderboard, streaks |
| AI Readiness Assessment | `/ai-readiness/*` | Free start → paid full → checkout → results → report |
| Founder Command Centre | `/founder/*` | Admin-only business intelligence dashboard |
| Member Hub | `/hub` | Downloads, progress tracking, onboarding |
| AI Coach | `/hub/coach` | Credit-based coaching with document library |
| Insights/Blog | `/insights/*` | Blog posts managed via Supabase |

### Auth & admin pattern

- Regular auth: `useAuth()` from `AuthContext`.
- Admin gate: `useAdminAuth()` hook — calls `supabase.rpc('has_role', { _user_id, _role: 'admin' })` to check role via database function.
- Admin pages live under routes like `/admin`, `/news/admin`, `/knowledge/admin`, etc.

### Data fetching pattern

TanStack Query is used for all server state. Supabase calls are made directly in hooks (not via a separate API layer). Edge functions are called via `supabase.functions.invoke('function-name', { body })`.

### Payments

Stripe is integrated via edge functions (`create-product-checkout`, `create-report-checkout`, `create-credit-checkout`, `stripe-product-webhook`, `credit-purchase-webhook`).
