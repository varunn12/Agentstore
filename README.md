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
| `AGENTSTORE_API_KEY` | Secret for CI to POST eval results to `/api/agents/[slug]/ci` |

See `.env.example` for local development.

## CI integration

Agent Store can receive eval results and manifest updates from GitHub Actions on every push.

### 1. Configure Agent Store

Set `AGENTSTORE_API_KEY` in `.env.local` (local) or Vercel environment variables (production). Use a long random string.

### 2. Add the workflow to your agent repo

Copy `templates/github-actions/agentstore-report.yml` to `.github/workflows/agentstore-report.yml` in the agent repository.

Add GitHub Actions secrets:

| Secret | Value |
|--------|-------|
| `AGENTSTORE_URL` | Your deployed Agent Store URL (e.g. `https://agentstore.vercel.app`) |
| `AGENTSTORE_API_KEY` | Same value as `AGENTSTORE_API_KEY` on Agent Store |
| `AGENTSTORE_SLUG` | The agent's catalog slug (e.g. `agent-ars`) |

### 3. Produce eval results (optional)

After your test step, write `eval-results.json` at the repo root. See `templates/eval-results.example.json` for the format.

If the file is missing, the workflow still runs `syncManifest: true`, which re-reads `agent.manifest.json` from GitHub and updates technical scores and GTM checklist items.

### 4. API reference

```bash
curl -X POST "$AGENTSTORE_URL/api/agents/$SLUG/ci" \
  -H "Authorization: Bearer $AGENTSTORE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "syncManifest": true,
    "evalSuites": [{ "id": "suite-contract", "name": "Contract Tests", ... }],
    "technicalScores": { "latency": 92 },
    "metadata": { "commitSha": "abc123", "branch": "main" }
  }'
```

Local testing:

```bash
chmod +x scripts/report-to-agentstore.sh
AGENTSTORE_URL=http://localhost:3000 \
AGENTSTORE_API_KEY=your-secret \
AGENTSTORE_SLUG=agent-ars \
./scripts/report-to-agentstore.sh templates/eval-results.example.json
```

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
| POST   | `/api/agents/[slug]/sync` | Re-sync from linked GitHub repo (manifest + README) |
| POST   | `/api/agents/[slug]/ci` | CI report — eval suites, scores, manifest sync (`Authorization: Bearer`) |

## Next Steps

- Add auth for team-only dashboard access
- Migrate `data/agents.json` to a database (Postgres, Supabase)
- Import agents from Cursor agent configs or MCP manifests
