# Poteto — Daily Human Audit

A zero-login, 90-second daily CAPTCHA comedy game built with **Astro 5 + React 19 + Tailwind CSS v4 + DaisyUI v5 + Cloudflare Workers + Neon (PostgreSQL)**.

## Highlights
- **Zero-Friction Entry**: Iconic "I'm not a robot" CAPTCHA box with a peeking Idaho control potato (Spud #01), daily audit serial, live UTC midnight countdown, and yesterday's doodle report.
- **Global Deterministic 3-Stage Audit**:
  1. **Stage 1 (UGC Potato Audit)**: 8 community-drawn vector potatoes + 1 sharp-edged hexagon rock impostor, mid-selection shuffle twist, laser scan reveal, and 3-flag community takedowns.
  2. **Stage 2 (16 Unhinged Mini-Games)**: Rotates daily across 16 multi-beat anti-intuition games (Commitment Issues Button, Touch Nothing Challenge, Impulse Control Trap, Anti-Spud Spellcheck, etc.) with zero repeats across 16 days.
  3. **Stage 3 (10-Second Sketch ID)**: Normalized `0–100` integer canvas with Ramer-Douglas-Peucker compression (300–600 bytes JSON), 4-stroke / 10-second / closed-loop constraints, live geometry roasts, and laser ID scan.
- **Laminated Human License**: Automatically embeds your sketch as the official ID photo, with one-click Wordle-style emoji share, PNG export, Endless Mode, and daily reminders.

## Quick Start

```bash
pnpm install
pnpm generate:assets
pnpm dev
```

## Database Setup (Neon PostgreSQL)

Execute [`db/schema.sql`](./db/schema.sql) in Neon SQL Editor and set `DATABASE_URL` in Cloudflare Workers secrets. Without `DATABASE_URL`, Poteto runs seamlessly on its curated seed pool.

## Daily Curation Script (Layer 2)

```bash
DATABASE_URL=... GEMINI_API_KEY=... pnpm curate
```

## Deploy to Cloudflare Workers

```bash
pnpm build
pnpm deploy
```
