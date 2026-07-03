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
- **License:** request one at [info@cortexmind.net](mailto:info@cortexmind.net)

## This repo

Static site for `cortexmind.net` — `index.html`, `style.css`, `script.js`. Served via GitHub Pages with a custom domain (`CNAME`). Also hosts the signed release artifacts and the auto-update manifest (`update-v2.json`) the desktop app polls.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## License

© 2026 Mathieu-Philippe Bourgeois. All rights reserved.
