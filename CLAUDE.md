# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repo is currently a scaffold — directory structure exists (`scraper-worker/`, `web/`, `db/`, `docker/`) but contains no implementation yet (only `.gitkeep` placeholders). `scraper-worker/profile.md` is a stub to be filled in. The full design lives in `SPEC.md` — read it before implementing anything, since there are no build/lint/test commands yet and the architecture below is intent, not (yet) working code.

## Purpose

Automated pipeline that scrapes Reddit for signals of unmet AI/automation product needs (posts where someone describes a problem or says "someone should build X"). Each signal is filtered and scored by Claude, then surfaced on a personal read-only dashboard as a concrete opportunity: what it is, why Henry is positioned to build it, and what to ship this week to test it. Not a project tracker — status/follow-through lives elsewhere (e.g. Notion).

## Architecture

Three-service pipeline, packaged as Docker Compose (`scraper-worker`, `web`, `db`), deployed to a small VPS:

```
Reddit API → scraper-worker (cron + manual trigger)
           → Stage 1 cheap filter (Haiku 4.5) — discards non-signal posts
           → Stage 2 deep analysis (Sonnet 5, swappable via ANALYSIS_MODEL) — only on Stage 1 survivors
           → Postgres (opportunities + seen_posts tables)
           → score ≥ 8/10 → Twilio WhatsApp alert
Next.js dashboard reads Postgres as a read-only feed.
```

- **`scraper-worker/`** — Node.js/TypeScript worker: Reddit OAuth polling (`src/reddit/`), DB access (`src/db/`), scheduled/triggered jobs (`src/jobs/`), Claude API calls (`src/ai/`). Runs on a cron (`node-cron`, default every 6h via `SCRAPE_CRON_SCHEDULE`) plus a manual "Run now" trigger invoked from the dashboard.
- **`web/`** — Next.js (App Router) dashboard: server-rendered read-only feed (`app/`), UI (`components/`). No auth in v1 — access controlled at the network level (VPS firewall/basic auth/Tailscale, undecided).
- **`db/migrations/`** — Postgres schema migrations. Two core tables: `opportunities` and `seen_posts` (dedup by Reddit post ID/URL).
- **`docker/`** — Docker Compose packaging for all three services, used both for local dev and VPS deployment.

### Two-stage AI pipeline (see SPEC.md §5 for full schemas)

1. **Stage 1 (Haiku 4.5, `FILTER_MODEL`)** — cheap pass over every candidate post: `{ is_signal: boolean, reason: string }`. In-memory only, not persisted.
2. **Stage 2 (Sonnet 5 default, `ANALYSIS_MODEL`, swappable to Opus/Fable)** — runs only on Stage 1 survivors. Injects `scraper-worker/profile.md` (Henry's skills/constraints/goals — the single source of truth for "why Henry wins" reasoning) as context. Outputs a structured opportunity: title, signal, why_henry_wins, first_move_this_week, and a composite score (overall + 4 sub-scores: demand_signal_strength, buildability, competition_saturation, monetization_potential).

### Key constraints from the spec

- **No full post/comment body retention** — only source URL, title, subreddit, timestamp, and AI-generated fields are stored (Reddit ToS/storage concerns). Post bodies are used in-memory during analysis only.
- **Dedup** is keyword/title-overlap based in v1, not semantic/embedding — that's a noted v2 candidate.
- **Model swapping** must stay env-var driven (`FILTER_MODEL`, `ANALYSIS_MODEL`) — never hardcode a model name in application code.
- **Out of scope for v1**: X/Twitter scraping, semantic dedup, status tracking on the dashboard, multi-user auth, historical backfill.

## Environment

Config is via `.env` (see `.env.example` for the full list): Reddit OAuth credentials, `ANTHROPIC_API_KEY` + `FILTER_MODEL`/`ANALYSIS_MODEL`, `DATABASE_URL`, Twilio WhatsApp credentials, `SCRAPE_CRON_SCHEDULE`, `NEXT_PUBLIC_APP_URL`.
