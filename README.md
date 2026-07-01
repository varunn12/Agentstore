# Agent Store

A central hub for your product team's agents — catalog them for GTM, track technical scores, run evals, and monitor launch readiness.

## Features

- **Agent Catalog** — Browse all agents with search, category, and status filters
- **Technical Scoring** — Weighted scores across reliability, latency, tool use, safety, maintainability, and documentation
- **Eval Tracking** — Per-suite pass rates, case-level results, latency, and failure notes
- **GTM Readiness** — Launch checklists, taglines, target audience, and use cases
- **Compare View** — Side-by-side comparison of agents across all score dimensions
- **Team Dashboard** — Add agents, update scores, and manage metadata

## Deploy to Vercel

### 1. Push to GitHub

Create a repo and push this project. Ensure `data/agents.json` is committed — it seeds production on first deploy.

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Vercel auto-detects Next.js — no build settings changes needed.
3. Deploy.

Or deploy from the CLI:

```bash
npm i -g vercel
vercel login
vercel
```

### 3. Add Vercel Blob storage (required for dashboard edits)

Vercel's serverless filesystem is read-only, so agent CRUD uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob):

1. In your Vercel project → **Storage** → **Create Database** → **Blob**
2. Connect the Blob store to this project
3. Redeploy — Vercel sets `BLOB_READ_WRITE_TOKEN` automatically

Without Blob, the catalog is read-only (served from committed `data/agents.json`).

### 4. Environment variables (optional)

In Vercel → **Settings** → **Environment Variables**, add:

| Variable | Purpose |
|----------|---------|
| `GITHUB_CLASSIC_TOKEN` | Import private GitHub repos (classic PAT with `repo` scope) |
| `GITHUB_TOKEN` | Fine-grained PAT alternative for repo import |

See `.env.example` for local development.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first run locally, sample agents are seeded into `data/agents.json`. Local CRUD persists to that file; production uses Vercel Blob when connected.

## Project Structure

```
src/
  app/                  # Next.js pages & API routes
  components/           # UI components
  lib/
    types.ts            # Agent, eval, and GTM types
    scoring.ts          # Score computation & grading
    store.ts            # File-based persistence
    seed-data.ts        # Sample agents
data/
  agents.json           # Runtime data (auto-created)
```

## Scoring Model

**Technical Score** (0–100) is a weighted average:

| Dimension        | Weight |
|------------------|--------|
| Reliability      | 25%    |
| Tool Use         | 20%    |
| Safety           | 20%    |
| Latency          | 15%    |
| Maintainability  | 10%    |
| Documentation    | 10%    |

**Eval Pass Rate** = passed cases / total cases across all suites.

**GTM Readiness** = completed checklist items / total checklist items.

## API

| Method | Endpoint              | Description     |
|--------|-----------------------|-----------------|
| GET    | `/api/agents`         | List all agents |
| POST   | `/api/agents`         | Create agent    |
| POST   | `/api/agents/import`  | Import from GitHub (`{ repoUrl, preview? }`) |
| GET    | `/api/agents/[slug]`  | Get agent       |
| PUT    | `/api/agents/[slug]`  | Update agent    |
| DELETE | `/api/agents/[slug]`  | Delete agent    |

## Next Steps

- Connect eval runners to CI for automated score updates
- Add auth for team-only dashboard access
- Migrate `data/agents.json` to a database (Postgres, Supabase)
- Import agents from Cursor agent configs or MCP manifests
