# International Maarif Schools of Tunisia: website and maarifcms

Public site, API and CMS for tn.maarifschool.org, all on Cloudflare. Architecture and decisions: `../ARCHITECTURE.md` in the planning folder (copy it into `docs/` when this folder becomes its own repository).

```
apps/web        Next.js public site       → Worker maarif-web  (no data bindings)
apps/api        Hono API, the single door → Worker maarif-api  (forms, media, internal reads)
apps/cms        maarifcms: Payload 3      → Worker maarif-cms  (the only Worker bound to D1)
packages/contracts   shared zod schemas and types (locales, grades, forms)
packages/tokens      design tokens from DESIGN.md
```

Request path: visitor → `maarif-web` → `maarif-api` → `maarif-cms` → D1. Each layer calls only the next one, over private service bindings.

## Requirements

- Node.js 22.23+ or 24.22+ (Payload's requirement)
- pnpm 10 (`corepack enable`, or prefix commands with `npx -y pnpm@10`)
- A Cloudflare account with Workers Paid (Payload's bundle is above the free plan's limit) and R2 enabled

## Setup

```powershell
pnpm install
Copy-Item apps/api/.dev.vars.example apps/api/.dev.vars   # then edit values
# apps/cms/.env holds PAYLOAD_SECRET for local runs (never commit it)
```

## Everyday commands

| Task | Command |
|---|---|
| All tests | `pnpm test` |
| All typechecks | `pnpm typecheck` |
| Contract tests | `pnpm --filter @maarif/contracts test` |
| API tests | `pnpm --filter @maarif/api test` |
| CMS access-control tests (local D1) | `pnpm --filter @maarif/cms test:int` |
| One test file | `pnpm --filter @maarif/api exec vitest run src/index.test.ts` |
| Run the CMS locally | `pnpm --filter @maarif/cms dev` → http://localhost:3000/admin |
| Run the site locally | `pnpm --filter @maarif/web dev` |
| Run the API locally | `pnpm --filter @maarif/api dev` |
| After changing CMS collections | `pnpm --filter @maarif/cms generate:types` then `pnpm --filter @maarif/cms payload migrate:create <name>` |

## Cloudflare resources

| Resource | Name | Used by |
|---|---|---|
| D1 database | `maarif-db` (Western Europe) | `maarif-cms` only |
| R2 bucket | `maarif-media` (private) | `maarif-cms` (write), `maarif-api` (read, planned) |
| R2 bucket | `maarif-next-cache` | `maarif-web` (OpenNext page cache) |
| Rate limiter | `FORM_LIMITER` (5 per minute) | `maarif-api` |

Secrets (set with `wrangler secret put <NAME>` in the app folder):

| Worker | Secrets |
|---|---|
| `maarif-cms` | `PAYLOAD_SECRET` |
| `maarif-api` | `TURNSTILE_SECRET`, `CMS_API_KEY` (the API key of the gateway's `api-clients` document) |

## Deploy (order matters)

**Normal path:** push to `main` (or run "Deploy to Cloudflare" in GitHub Actions). `.github/workflows/deploy.yml` builds on Linux and deploys the three Workers in order; its header lists the repository secrets it needs. Demo hostnames: site `https://yassinekhiari.download`, admin `https://cms.yassinekhiari.download/admin`; maarif-api has no public URL (the site forwards `/api/*` to it over the service binding). Manual steps, for reference:

1. `maarif-cms`: `pnpm --filter @maarif/cms payload migrate` against the remote D1 (`NODE_ENV=production`), then `pnpm --filter @maarif/cms deploy:app`.
2. `maarif-api`: `pnpm --filter @maarif/api deploy`.
3. `maarif-web`: `pnpm --filter @maarif/web deploy` with `SITE_URL` set; `SITE_INDEXABLE=true` only in production.

The CMS deploy scripts use `$CLOUDFLARE_ENV` (bash syntax); run them from Git Bash or CI on Linux.

## Rules that keep the site secure

- Never add a D1 or R2 write binding to `maarif-web` or `maarif-api`.
- Public input is validated in `packages/contracts` and enforced again in `apps/api`.
- Every Payload collection defines access for create, read, update and delete; anonymous access is denied.
- When calling Payload's Local API on behalf of a user, pass `overrideAccess: false`.
