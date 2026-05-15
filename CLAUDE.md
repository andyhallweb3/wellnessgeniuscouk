# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Product Is

**Wellness Genius** is an AI-powered business intelligence platform for fitness and wellness operators — gym owners, studio operators, hotel wellness directors, and similar. It is not a consumer fitness app.

The core value proposition: operators ask business questions ("Why is my January retention down 8%?") and get actionable, wellness-specific answers in under 60 seconds. Everything on the platform serves that loop.

**Target user:** UK wellness operators who are time-poor, sceptical of generic AI tools, and need practical answers — not hype.

**Tone for all copy and UI text:** British English. Direct and commercially grounded. No filler phrases, no jargon overload, no overpromising. Dry humour is fine where appropriate. Always lead with outcomes, not features.

---

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

---

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
| Genie (AI Advisor) | `/genie` | Multi-mode AI chat, voice interface, leaderboard, streaks. 8 expert modes. |
| AI Readiness Assessment | `/ai-readiness/*` | Free start → paid full → checkout → results → report. C.L.E.A.R framework. |
| Founder Command Centre | `/founder/*` | Admin-only business intelligence dashboard |
| Member Hub | `/hub` | Downloads, progress tracking, onboarding |
| AI Coach | `/hub/coach` | Credit-based coaching with document library |
| Insights/Blog | `/insights/*` | Blog posts managed via Supabase |
| Products/Downloads | `/products` | Playbooks, templates, bundles — Stripe checkout |

### Auth & admin pattern

- Regular auth: `useAuth()` from `AuthContext`.
- Admin gate: `useAdminAuth()` hook — calls `supabase.rpc('has_role', { _user_id, _role: 'admin' })`.
- Admin pages live under `/admin`, `/news/admin`, `/knowledge/admin`, etc.

### Data fetching pattern

TanStack Query for all server state. Supabase calls made directly in hooks. Edge functions called via `supabase.functions.invoke('function-name', { body })`.

### Payments (Stripe)

Edge functions: `create-product-checkout`, `create-report-checkout`, `create-credit-checkout`, `stripe-product-webhook`, `credit-purchase-webhook`.

---

## Commercial Model & Pricing

Credits are the core unit of value — 1 credit = 1 AI Advisor message.

| Tier | Price | Credits |
|------|-------|---------|
| Free trial | £0 | 10 credits, 14 days |
| Pay as you go | £0.18/message | From £9 for 50 |
| AI Advisor Pro | £19.99/month | 40 credits/month |
| AI Advisor Expert | £39.99/month | 120 credits/month |

**One-off products** (Stripe):

| Product | Price |
|---------|-------|
| AI Readiness Quick Check (Lite+) | £9.99 |
| Wellness AI Prompt Pack | £19.99 |
| Wellness Engagement Systems Playbook | £29.99 |
| AI Readiness Score — Commercial Edition | £39.99 |
| Gamification, Rewards & Incentives Playbook | £39.99 |
| 90-Day AI Activation Playbook | £49.99 |
| Wellness AI Operator Bundle | £79.99 |
| Gamification & Personalisation Bundle | £69.99 |
| Execution Bundle | £89.99 |

Free gated resources (email capture): AI Structure Ebook, 90-Day Checklist PDF, AI Myths Deck.

---

## The C.L.E.A.R Framework

Proprietary diagnostic framework underlying the AI Readiness Assessment, Quick Check, and all paid playbooks. When building assessment or scoring UI, C.L.E.A.R is the model — do not substitute generic scoring logic.

---

## Conversion Funnel

Primary: **Free AI Readiness Assessment → credit purchase or subscription**. Every page should reduce friction toward this path. CTAs should be outcome-led ("Get your AI Readiness Score", "Ask your first question free") not feature-led.

Secondary: **free gated PDF → email capture → paid product upsell**.
