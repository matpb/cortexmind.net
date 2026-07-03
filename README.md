# cortexmind.net

Marketing site and release host for **CortexMind** — local-first persistent memory for AI agents.

**Live site:** [cortexmind.net](https://cortexmind.net)

---

## What CortexMind is

A small desktop app for macOS, Windows, and Linux that gives your AI agents — Claude Code, Claude Desktop, claude.ai, or any MCP client — a shared, persistent memory that stays on your machine.

It's an MCP server exposing six clean tools (`memory_save`, `memory_save_fact`, `memory_search`, `memory_recall`, `memory_get`, `memory_status`), backed by SQLite + sqlite-vec, Jina Embeddings v3, and a bge-reranker-v2-m3 cross-encoder. Hybrid keyword + dense retrieval with cross-encoder re-ranking — finds what you mean, not just what you typed.

No LLM in the write path. Your memory never leaves your machine.

- **Source:** [matpb/cortexmind](https://github.com/matpb/cortexmind) (proprietary)
- **Downloads:** [latest release](https://github.com/matpb/cortexmind.net/releases/latest)
- **License:** buy on [cortexmind.net](https://cortexmind.net) — Polar.sh checkout, license key delivered on the success page

## This repo

Site for `cortexmind.net` — `index.html`, `style.css`, `script.js`, plus two
Cloudflare Pages Functions for the self-serve purchase flow:

```
functions/api/create-polar-checkout.js   POST /api/create-polar-checkout  (Polar.sh)
functions/api/get-license-key.js         POST /api/get-license-key  ({checkout_id})
success.html                             checkout redirect target — shows the CMND- key
```

Served via **Cloudflare Pages** (project `cortexmind-net`; deployed by the
GitHub Action on push to `main`). Also hosts the signed release artifacts and
the auto-update manifest (`update-v2.json`) the desktop app polls — note the
updater pulls it from `raw.githubusercontent.com`, independent of the site
host.

Env vars (Pages project, never committed): `POLAR_ACCESS_TOKEN`,
`POLAR_PRODUCT_IDS` (the 2 CortexMind product UUIDs, must match the
`data-product` values in `index.html`), optional `POLAR_API_BASE`
(sandbox: `https://sandbox-api.polar.sh`).

## Local preview

```bash
cp .dev.vars.example .dev.vars   # fill in sandbox values
npx wrangler pages dev .
# open http://localhost:8788 — static site + Functions
```

(Plain `python3 -m http.server` still works for styling, but checkout will 404
without the Functions runtime.)

## License

© 2026 Mathieu-Philippe Bourgeois. All rights reserved.
