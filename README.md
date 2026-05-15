# Wellness Genius

AI-powered business intelligence for fitness and wellness operators.

**Live site:** https://www.wellnessgenius.co.uk

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, edge functions)
- TanStack Query, React Router v6
- Stripe (payments)
- Bun (package manager / runtime)

## Local development

```sh
# Install dependencies
bun install

# Start dev server at http://localhost:8080
bun run dev
```

**Always use `bun`** — not npm or yarn.

## Environment variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=https://hiayegpvrsxhhemyxghz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your_supabase_anon_key>
```

## Deployment

Hosted on Vercel. Connected to the `main` branch of this repo — pushes deploy automatically.

Set the same two env vars in the Vercel project settings.

## Supabase edge functions

```sh
# Deploy a single function
supabase functions deploy <function-name>

# Deploy all functions
supabase functions deploy
```

## See also

`CLAUDE.md` — codebase guidance for AI assistants.
