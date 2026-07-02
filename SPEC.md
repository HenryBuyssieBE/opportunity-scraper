# Opportunity Scraper 2.0 — Spec

## 1. Purpose

An automated pipeline that scrapes Reddit (v1; X/Twitter in a later phase) for signals of unmet AI/automation product needs — posts where someone describes a problem, complains about an existing tool, or explicitly asks "someone should build X." Each signal is filtered, analyzed, and scored by Claude, then surfaced on a personal dashboard as a concrete, actionable opportunity: what it is, why Henry specifically is positioned to build it, and what to ship this week to test it.

Goals:
- Steady stream of scoped side-project ideas Henry can actually execute on solo in ≤1 week.
- A forcing function to practice AI-native development (Claude API, automation, scraping) on a recurring cadence.
- A read-only feed, not a project tracker — status/follow-through lives elsewhere (e.g. Notion).

## 2. High-Level Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────────┐     ┌─────────────┐
│  Reddit API │────▶│  Scraper worker  │────▶│  Stage 1: cheap    │────▶│  Postgres    │
│  (PRAW-eq.) │     │  (cron + manual) │     │  filter (Haiku)    │     │  (Supabase)  │
└─────────────┘     └──────────────────┘     └─────────┬──────────┘     └──────┬──────┘
                                                          │ survivors               │
                                                          ▼                         │
                                              ┌────────────────────┐               │
                                              │ Stage 2: deep       │               │
                                              │ analysis (Sonnet/   │───────────────┘
                                              │ Opus, swappable)    │
                                              └─────────┬──────────┘
                                                          │ score ≥ threshold
                                                          ▼
                                              ┌────────────────────┐
                                              │ Twilio WhatsApp     │
                                              │ alert               │
                                              └────────────────────┘
                                                          
┌─────────────────────────┐
│ Next.js dashboard        │──reads from Postgres (read-only feed)
└─────────────────────────┘

All services packaged as Docker Compose, deployed to a small VPS (e.g. Hetzner CX22, ~€4-5/mo).
```

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Scraper | Node.js/TypeScript script using Reddit's official OAuth API | Targeted subreddit list only (no cross-Reddit search in v1) |
| Scheduling | `node-cron` inside a long-running worker container, + manual "Run now" button in dashboard | Runs every 6 hours by default |
| AI Stage 1 (cheap filter) | Claude Haiku 4.5 (`claude-haiku-4-5`) | Discards obviously irrelevant posts before the expensive pass |
| AI Stage 2 (deep analysis) | Claude Sonnet 5 (`claude-sonnet-5`) by default | Model must be swappable via env var (`ANALYSIS_MODEL`) — Henry can point this at Opus/Fable for higher quality at higher cost |
| Database | PostgreSQL via Supabase (self-hosted in Docker Compose, or Supabase cloud free tier — see open question in §9) | Single `opportunities` table + `seen_posts` dedup table |
| Dashboard | Next.js (App Router) | Server-rendered read-only feed, no auth needed initially (single-user, VPS behind basic auth or Tailscale) |
| Alerts | Twilio WhatsApp Business API | Fires when an opportunity's composite score ≥ 8/10 |
| Packaging | Docker Compose (scraper worker, Next.js app, Postgres) | Deployed to a Hetzner (or similar) VPS for 24/7 uptime; local Docker Compose used for dev |

## 4. Reddit Scraping

- **Method:** Official Reddit API (OAuth `script` app type), polling new posts (and optionally top comments) since the last successful run.
- **Scope (v1):** A curated, hardcoded list of subreddits (tune after first runs): `r/SomebodyMakeThis, r/SaaS, r/Entrepreneur, r/startups, r/smallbusiness, r/SideProject, r/artificial, r/automation, r/nocode, r/freelance`.
- **Cadence:** Every 6 hours via cron inside the worker container, plus a manual "Run now" trigger exposed as a button/API route in the dashboard.
- **Dedup:** Track processed Reddit post IDs (and thread URLs) in a `seen_posts` table. Skip posts already processed. Basic keyword/title overlap check on new candidates against recent `opportunities` entries to catch near-duplicate ideas across subreddits (no embeddings/semantic dedup in v1 — noted as a v2 candidate).
- **Data retention:** Do **not** persist full post/comment bodies. Store only: source URL, post title, subreddit, timestamp, and the AI-generated fields. The dashboard links out to Reddit for full context. This keeps storage light and avoids Reddit ToS/display-retention concerns.

## 5. AI Analysis Pipeline (Two-Stage)

### Stage 1 — Cheap filter (Haiku 4.5)
- Input: new post title + body (in-memory only, not persisted) + a compact rubric.
- Output (structured, via `output_config.format` JSON schema): `{ is_signal: boolean, reason: string }`.
- Purpose: cheaply discard posts that are clearly not an AI/automation business signal (memes, unrelated discussion, etc.) before spending Sonnet-tier tokens.

### Stage 2 — Deep analysis (Sonnet 5, swappable)
- Runs only on Stage 1 survivors.
- Input: post title + body + a **Henry profile document** (see §6) injected as context, via `output_config.format` structured output.
- Output schema (all fields required):
  ```json
  {
    "title": "string — catchy product name for the opportunity",
    "signal": "string — the verbatim or lightly-paraphrased pain point/request",
    "why_henry_wins": "string",
    "first_move_this_week": "string",
    "score": {
      "overall": "integer 1-10",
      "demand_signal_strength": "integer 1-10",
      "buildability": "integer 1-10",
      "competition_saturation": "integer 1-10",
      "monetization_potential": "integer 1-10"
    },
    "source_url": "string",
    "subreddit": "string"
  }
  ```
- Model is configured via an environment variable so Henry can freely swap Sonnet ↔ Opus ↔ Fable without code changes.

### Henry profile document (context for Stage 2)
A short Markdown file (`profile.md`) checked into the repo, injected into every Stage 2 prompt, containing:
- Skills: integrations, automation, beginning AI-native dev (Claude Code, Anthropic API, n8n).
- Network/distribution: non-existent (yet)
- Constraints: solo, freelance-consulting side project, targeting Belgian SMEs; prefers ideas buildable in ≤1 week.
- Goals: build expertise, generate steady side-project stream, grow freelance AI consulting practice.
This file is the single source of truth for "why Henry wins" reasoning — update it as Henry's skills/network evolve.

## 6. Scoring

- Composite 1–10 score with 4 sub-scores (demand signal strength, buildability, competition/saturation, monetization potential) — see schema above.
- Dashboard sorts/filters by `overall` score by default; sub-scores shown on the card for transparency.

## 7. Dashboard

- **Type:** Read-only feed (no status tracking in v1 — Henry tracks follow-through elsewhere).
- **Card fields per opportunity:** Title, Signal (+ link to source Reddit thread), Why Henry Wins, First Move This Week, Score (overall + sub-score breakdown).
- **Sorting/filtering:** By score (default: highest first), by date, by subreddit.
- **Auth:** None required for v1 (single user); access controlled at the network level (VPS firewall / basic auth / Tailscale — decide during deployment, see §9).
- **Manual trigger:** A "Run scrape now" button that calls an API route which kicks off the scrape+analyze pipeline immediately (in addition to the 6-hour cron).

## 8. Alerting

- **Trigger:** Any new opportunity with `score.overall ≥ 8`.
- **Channel:** Twilio WhatsApp Business API — sends a WhatsApp message to Henry's phone with the title, one-line signal, score, and dashboard link.
- **Config:** Twilio Account SID, Auth Token, WhatsApp-enabled sender number, and Henry's WhatsApp number stored as environment variables/secrets (never committed).

## 9. Deployment

- **Packaging:** Docker Compose with three services — `scraper-worker` (Node cron + Reddit/Claude API calls), `web` (Next.js dashboard + API routes), `db` (Postgres).
- **Environment:** Local Docker Compose for development; the same Compose file deployed to a small VPS (e.g. Hetzner CX22, ~€4–5/month) for 24/7 uptime and phone access to the dashboard.
- **Secrets:** Reddit API credentials, Anthropic API key, Twilio credentials, DB connection string — via `.env` file (gitignored), loaded into containers.
- **Open questions to resolve during implementation:**
  - Self-hosted Postgres in Docker vs. Supabase cloud free tier (Supabase adds auth/storage extras for free but is one more external dependency; self-hosted Postgres is simpler to reason about for a single-user app and keeps everything on the one VPS).
  - Dashboard network exposure: reverse proxy with basic auth (Caddy/Nginx) vs. Tailscale (no public exposure at all, simplest secure option for a single user).

## 10. Cost & Volume Estimates (v1)

- 10 subreddits, new-posts-only, polled every 6h → expect low tens of candidate posts per run.
- Stage 1 (Haiku) runs on every candidate — cheap, ~$1/1M input tokens.
- Stage 2 (Sonnet 5, default) runs only on survivors — expect single-digit survivors per run in early tuning.
- VPS: ~€4–5/month. Twilio WhatsApp: pay-per-message, negligible at this alert volume.

## 11. Explicitly Out of Scope for v1

- X/Twitter scraping (planned v2).
- Semantic/embedding-based deduplication (v2 candidate if keyword dedup proves insufficient).
- Status tracking / project-management features on the dashboard.
- Multi-user support / authentication system beyond network-level access control.
- Historical/backfill scraping — only new posts from the time scraping begins.
