# mb-pack — Cloudflare Pages + D1 + Next.js + Hono

A production-ready starter for a packaging / gift-box trading website.

## Tech
- **Next.js 14 (App Router)** on Cloudflare Pages (via `@cloudflare/next-on-pages`)
- **Cloudflare Pages Functions + Hono** for API (Edge/Workers runtime)
- **Cloudflare D1** for database, managed by `wrangler d1 migrations`
- **Turnstile** ready (frontend stub), Zod validation on API

## Quick Start

1) **Install deps**
```bash
pnpm i
```

2) **Create D1 database (first time)**
```bash
wrangler d1 create mb-pack-db
# copy database_id into wrangler.toml under [[d1_databases]]
```

3) **Apply migrations + seed**
```bash
pnpm migrate
pnpm seed
```

4) **Run locally (Pages dev)**
```bash
pnpm dev
```

5) **Deploy (Cloudflare Pages + GitHub Actions)**
- Create a Pages project and connect this repo
- Build command: `npx @cloudflare/next-on-pages@latest`
- Build output: `.vercel/output/static`
- Functions directory: `functions/`
- In Pages project settings → **D1 Databases**: bind your DB to variable **DB**
- Set CF secrets for GitHub: `CF_API_TOKEN`, `CF_ACCOUNT_ID`

## Environment
- `NEXT_PUBLIC_API_BASE` (optional): e.g. `/_worker` or empty on Pages
- `APP_ENV`: `production` | `staging`

## Notes
- First deploy: run migrations from local CLI:
  ```bash
  wrangler d1 migrations apply mb-pack-db
  wrangler d1 execute mb-pack-db --file ./scripts/seed.sql
  ```
- Admin is stubbed; protect `/admin` using **Cloudflare Access** (Zero Trust).

Generated: 2025-11-12T04:36:29.858370Z
