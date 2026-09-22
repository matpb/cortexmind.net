# cortexmind.net design plan

Reference sites: both-hands.com (parent brand) and lantern.both-hands.com (sibling product).
CortexMind is Mathieu-Philippe Bourgeois's product; the palette and type are borrowed from both-hands.com by choice.

## Subject, audience, job

- Subject: a desktop app that gives AI agents one long-term memory, on the user's machine.
- Audience: developers and power users running Claude Code, Claude Desktop, claude.ai, ChatGPT, Codex or Cursor daily.
- Job of the site: make the reader feel what an agent with memory is like, then sell one license.
- Stance: this is the piece that makes agents work. Confident, specific, never breathless.

## Tokens

Dark is the default. Light is a full theme, not an afterthought.

| token | dark | light |
|---|---|---|
| --bg | #12161B | #FBF7F0 |
| --panel | #1A1F26 | #FFFDF8 |
| --panel-2 | #222831 | #F1EAD9 |
| --text | #EEE8DA | #2B3440 |
| --text-2 | #CFC7B6 | #3F4854 |
| --muted | #9A9486 | #6E6A60 |
| --muted-2 | #7C776B | #8A8475 |
| --line | #2B323B | #E2DACA |
| --line-2 | #3A424D | #C9C0AD |
| --gold | #D9A441 | #D9A441 |
| --gold-hover | #E9B85A | #C8912E |
| --gold-text | #E4B454 | #8C5F12 |
| --gold-soft | #2B2519 | #F6E7C4 |
| --gold-line | #8A6A2A | #D9B476 |
| --on-gold | #1B1508 | #1B1508 |
| --teal | #6FA39D | #3E6B66 |
| --code-bg | #0C0F13 | #F1EAD9 |
| --code-text | #E7C99E | #5A3D10 |
| --selection | #5A4520 | #F2D9A8 |

Slate is cool (blue-grey), Lantern's is warm brown. Same gold. That is the family resemblance and the difference.

Photo bands (hero, how-band, cta-band) force the dark tokens in both themes, like Lantern.

## Type

Self-hosted via @fontsource-variable. No Google Fonts request.

- Display: Fraunces variable (opsz 9..144, wght 300..700). h1 wght 400 at large opsz, letter-spacing -0.025em, line-height 0.98. h2 wght 400. Fraunces' optical size at 96px is the personality of the page.
- Body and UI: Space Grotesk variable, wght 400..600. Body 16-17px, line-height 1.65, max 68ch.
- Code: JetBrains Mono variable, 13px.

Scale: 12, 13, 14, 15, 17, 19, 22, 28, 36, 48, clamp(44px, 7vw, 96px) for h1.

No all-caps eyebrows. No single accent word in headlines. Section labels are plain sentence-case text in --muted when needed, mostly not needed.

## Layout

Left-aligned throughout. Max width 1184px, 48px gutters desktop, 24px phone. Sections separated by 1px --line rules and 96px padding (60px phone).

Home:

```
+--------------------------------------------------------------+
| logo CortexMind          How it works  Docs  Pricing  [Start] |  header over hero, transparent
|                                                                |
|  (video: gold thread through glass panes, full bleed, loop)    |
|  Your agents forget                                            |
|  everything.                       <- h1 Fraunces, 2 lines     |
|  lead 480px, CTA gold + ghost, fine print                      |
+--------------------------------------------------------------+
| Works with  Claude Code  Claude Desktop  claude.ai  ChatGPT   |  client band
|             Codex  Cursor  any MCP client                      |
+--------------------------------------------------------------+
| [still: single glass card lit gold]  | Every session is day    |  photo band (problem)
|                                       | one. Until now.         |
+--------------------------------------------------------------+
| dark band with bg still: How it works                          |
|   1 Install, paste key   2 Connect agent   3 It boots w/memory |  numbered: it IS a sequence
+--------------------------------------------------------------+
| Finds what you meant  | [transcript panel: memory_search call  |  feature split
| pipeline in 3 lines   |  and result, real shape]               |
+--------------------------------------------------------------+
| Starts every conversation already knowing your rules           |  boot card section
| [rendered boot card: standing rules, last turns]               |
+--------------------------------------------------------------+
| [dashboard screenshot, wide]   Explore your mind, locally      |  product section
+--------------------------------------------------------------+
| Yours. On your machine.  3 columns: local, GPU, tunnel         |
+--------------------------------------------------------------+
| Pricing: Monthly $10 (14-day trial)  Yearly $99 (featured)     |  Polar checkout, unchanged ids
+--------------------------------------------------------------+
| Download: mac / win / linux from update-v2.json  + requirements |
+--------------------------------------------------------------+
| FAQ (details/summary, 8 items)                                  |
+--------------------------------------------------------------+
| cta band on still                                               |
| footer: CortexMind . a Both Hands product . docs changelog ...  |
+--------------------------------------------------------------+
```

Docs page: 220px sticky side nav + content, same as Lantern's docs-grid. Code blocks with copy button.
Changelog: one column, each release a section: version, date, notes rendered from GitHub release markdown.
Privacy and Terms: 680px measure, plain.
Success page (post-checkout): keeps today's flow exactly (checkout_id, /api/get-license-key, poll, copy key), restyled.

## Motion

One orchestrated moment: the hero video (6s loop, muted, playsinline, poster fallback, hidden under prefers-reduced-motion). Nothing else moves on its own. Hover and focus states answer the user. No scroll-reveal.

## The memorable thing

The gold thread. Every generated image is the same physical idea: a thread of warm light passing through frosted glass panes in a dark slate space. Memory threading through conversations. The site never explains the metaphor.

## Anti-default review

- Near-black + one bright accent: the brief pins gold on slate, kept. The slate is a real blue-grey (#12161B), not tinted black, and the gold is the parent brand's.
- Cream + serif + terracotta: not used. Light theme is paper + slate + gold.
- SaaS card kit: only pricing uses cards. Features are rules and columns, not boxes.
- Eyebrow labels in caps: none. Mono for data labels: only inside the transcript and requirements, where it is data.
- Arrows appended to links: none.
- Numbered steps: only in How it works, which is a sequence.

## Copy rules

- Sentence case everywhere, including buttons.
- Buttons say what happens: "Start free trial", "Buy yearly", "Download for macOS", "Copy".
- Numbers only when measured and cited in facts.md.
- No time-invested language, no "we", no exclamation marks.
- French via the translate-french skill from messages/en.json.

## Build

SvelteKit 2 + Svelte 5, adapter-static, Paraglide JS 2 for EN/FR (copy the pattern from lantern/web: messages/{en,fr}.json, [[locale=locale]] route group, /fr prefix, hreflang, sitemap).
Downloads and version come from update-v2.json at build time (import at repo root). No release URL is ever typed in a Svelte file.
Cloudflare Pages: build output `build/`, `functions/` untouched at repo root, GitHub Action runs `npm ci && npm run build` then `wrangler pages deploy build`.
