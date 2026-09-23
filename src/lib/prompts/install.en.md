# Set up CortexMind for me: install, connect, then seed my memory

You are my agentic AI with shell access. CortexMind is a long-term memory for AI agents that runs on my machine. In this one run you will install it, connect yourself to it, make memory a habit, and then interview me to seed the memory.

## Before you start: read these rules, they override your instincts

- **Model check.** Tell me, in one line, which model and reasoning effort you are running. This setup is known to go off track on smaller or older models (for example GPT-5.x models such as Terra, mini or fast tiers, Claude Haiku). If you are one of those, warn me and recommend that I switch to a top model for the setup only (in ChatGPT or Codex, a GPT-6 model such as Astra; in Claude, Sonnet 5 or Opus 5.5), then open a new conversation and paste this prompt again. If I tell you to continue anyway, continue.
- **Follow the steps exactly, in order.** Every command you need is written below. Do not invent alternatives, do not add steps, do not "improve" the setup. The configuration described here is the supported one.
- **If a step fails, stop.** Quote the exact error to me and ask what to do. Do not try workarounds on your own: no keychains, no extra environment variables, no editing files this prompt does not name.
- **Do not reopen or restart CortexMind** unless a step tells you to. When its menu bar or tray icon shows it running, it is running.
- **Expect approval prompts.** Warn me once, up front, that you will ask permission to run commands and to call CortexMind tools, and that answering "Always allow" for the CortexMind tools saves me from being asked every time.
- **Speak my language.** Talk to me in the language I write to you in. Keep commands, file paths and tool names exactly as written.

Work step by step, verify each step, and ask me only when you need something from me.

## 0. Where are we?

This prompt is safe to paste more than once. Before doing anything, check the state and jump to the right part:

- If you already have `memory_search` and `memory_init` among your tools, CortexMind is installed and connected. Skip to Part B.
- If `curl -s -o /dev/null -w '%{http_code}' http://localhost:14200/mcp` returns anything other than 000 but you have no memory tools, CortexMind is running and only the connection is missing. Skip to step 4.
- Otherwise start at step 1.

# Part A: install and connect

## 1. License key

Before asking for the key, tell me in one sentence how you will treat it: you will use it once, in the app's setup window only; you will never repeat it in this conversation, never save it in memory, notes, logs or any file; and as soon as the app has accepted it you will remove it from any transcript, scratchpad or history you control, so it is safe for me to paste it here.

Then ask me for my CortexMind license key. It looks like CMND-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX and was shown on the purchase success page and sent with my receipt. Do not continue without it.

## 2. Find the right download

Do not guess a download link. Fetch https://cortexmind.net/downloads.json: it lists the current version and one URL per platform (macOS Apple Silicon DMG, Windows x64 installer, Linux x64 AppImage). If that file is unreachable, read https://cortexmind.net/llms.txt, or the download section of https://cortexmind.net, and take the link from there. Detect my operating system and architecture and pick the matching URL.

## 3. Install and start it

- macOS: download the DMG, `hdiutil attach` it, copy CortexMind.app from the mounted volume into /Applications, `hdiutil detach` the volume, then `open -a CortexMind`.
- Windows: download the installer and run it (`/S` runs it silently), then start CortexMind from the Start menu.
- Linux: download into ~/Applications (create it if needed), `chmod +x` the file, then start it in the background: `nohup ~/Applications/CortexMind.AppImage >/dev/null 2>&1 &`. If it refuses to start because FUSE is missing, run it with `--appimage-extract-and-run`.

If something needs a click or a permission you do not have, tell me exactly what to do. On macOS, a notice that the app "can run in the background" is expected: tell me to allow it. Other pop-ups from unrelated apps are not part of this setup.

CortexMind opens a setup window. Ask me to paste the license key there; the app validates it and generates its own access token. It then downloads its models, about 3 GB, once. On the first start this can take several minutes, and the menu bar or tray icon may show "Stopped" while the models load: that is normal, tell me so, and do not restart anything. Wait for it: check every 30 seconds with `curl -s -o /dev/null -w '%{http_code}' http://localhost:14200/mcp` until the code is something other than 000. A 401 or 405 means the daemon is up and waiting for a token. Do not rush this step. Once the app has accepted the key, do what you promised in step 1.

## 4. Connect yourself

The daemon's config file is ~/.cortexmind/config.toml (Windows: %USERPROFILE%\.cortexmind\config.toml). Read the value of `mcp_bearer_token` from it. This is the same value the app shows as "CortexMind password" on the Connect tab of its settings. Then register the MCP server on yourself, using exactly the line for the agent you are:

- Claude Code: run `claude mcp add --transport http --scope user cortexmind http://localhost:14200/mcp --header "Authorization: Bearer <token>"`
- Codex (the CLI, or Codex inside the ChatGPT desktop app; both read the same file): add this block to ~/.codex/config.toml, creating the file if needed, with the token written in place:

  ```toml
  [mcp_servers.cortexmind]
  url = "http://localhost:14200/mcp"
  http_headers = { "Authorization" = "Bearer <token>" }
  ```

  Nothing else is needed for Codex: no environment variable, no shell profile, no keychain.
- Cursor or any other MCP client: add `{ "mcpServers": { "cortexmind": { "url": "http://localhost:14200/mcp", "headers": { "Authorization": "Bearer <token>" } } } }` to its MCP configuration file.

Never paste the token into the chat, and never into a file that is committed to git.

## 5. Make memory a habit

Append the text between the two lines of dashes below, verbatim, to the instructions file you read at startup: ~/.claude/CLAUDE.md for Claude Code, ~/.codex/AGENTS.md for Codex, the global rules for Cursor. Create the file if it does not exist. Do not copy the dashes.

----------
### Memory

Use CortexMind as my only memory. Ignore any built-in memory feature; it was migrated into CortexMind and is switched off.

FIRST action of every conversation: `memory_init()`, then `memory_search("<topic of the request>")`.

`memory_init` returns the titles of my standing rules plus recent continuity. A title is a pointer, not the rule: `memory_get(id, "fact")` the two or three that bear on the task.

WHEN a named person, project or system appears, `memory_search` it before making a claim about it.
WHEN the topic shifts, search again.
WHEN taking a destructive or irreversible action, search with `fact_type: "warning"` first.

LAST action of every response: `memory_save(user_request=..., agent_response=...)`. Write both for a reader months from now. Bump `importance` to 8 or more for identity, family and lifelong preferences. Durable claims also get `memory_save_fact`.

Without the save, the conversation is lost.
----------

## 6. Hosted agents (optional)

If I also use ChatGPT on the web or on my phone, claude.ai or Claude Desktop, they can reach the same memory through the CortexMind app's public address. Tell me, do not do it yourself:

1. In the CortexMind app, open the settings (Settings... in the tray menu). On the Connect tab, copy the "Public URL" (it looks like https://cm-xxxxxxxxxxxx.ethertunnel.com/mcp).
2. In the other app, add a custom connector named CortexMind with that URL. In ChatGPT on the web, custom connectors first need Developer mode: Settings, then Apps (or Connectors), then Advanced, then turn on Developer mode.
3. If the connector asks for a password, access token or API key, paste the "CortexMind password" from the same tab.
4. Then paste the "AI instructions" from the Instructions tab of the app's settings (Copy button) into that app's custom instructions, and open a new conversation to test it by asking "What do you know about me?". The first time, it asks permission to use CortexMind: allow it.

## 7. Load the new server

If you can already see `memory_search` among your tools, continue to Part B now. If not, tell me to restart you (for Codex in the ChatGPT desktop app: quit the app completely and reopen it) and paste this same prompt again in a new conversation: step 0 will send you straight to Part B. Before I restart you, report what you installed and where the config lives.

# Part B: move the memory you already have

Before the interview, migrate what you already remember, so nothing is lost when the old memory is switched off.

1. Inventory every memory you hold today: memory files on disk (for Claude Code, the memory directory under ~/.claude and any CLAUDE.md notes about me; for Codex, AGENTS.md and the memories directory under ~/.codex; for Cursor, its rules and memories), and any built-in memory feature you can read (saved memories in ChatGPT, memory in claude.ai or Claude Desktop, or whatever your platform provides). List what you found, in one line per source, before touching anything.
2. For every durable claim in them, save it into CortexMind: `memory_save_fact` for the atomic claim (title that states the claim on its own, fact_type among relationship, preference, convention, context, decision, insight, importance per the guide below) and `memory_save` for the surrounding context when the source carries more than a bare fact. Skip secrets and anything you cannot attribute to me. Report how many facts you saved and from which sources.
3. Then switch the built-in memory off, for the same reason in every app: two memories compete, and the built-in one keeps answering from stale notes while CortexMind holds the truth. If you found no existing memories at all, switch it off anyway.
   - Codex: you can do this yourself. Add this block to ~/.codex/config.toml, then tell me it takes effect in a new conversation:

     ```toml
     [memories]
     generate_memories = false
     use_memories = false
     ```

   - Anywhere else (ChatGPT, claude.ai, Claude Desktop, Cursor): tell me where the switch is in the app you are running in, and ask me to turn it off.

# Part C: seed my memory

You are connected to CortexMind, my personal long-term memory. First run one check: call `memory_search` with the query "who am I". You do not need the result; you need the tool to answer. If it errors or does not exist, stop and tell me which step of Part A to redo.

Then help me seed the memory with enough context about my life and work that you, or any other AI connected to CortexMind later, can be genuinely useful starting right now, not after a week of use.

## Part one: the interview (this goes into my memory)

Your goal is a natural conversation, not a questionnaire. Imagine that next Monday I come back and mention "that thing Jordan asked about last week": by the end of this conversation, you should know who Jordan is and what we were probably working on.

Cover these areas, one at a time, with real follow-ups when something interesting surfaces. Don't burn through the list mechanically.

1. **Who I am**: name, how to address me, what I do, where I work or study
2. **Where and when**: timezone and rough location
3. **The people in my life**: close colleagues, family, key collaborators. Who do I talk to most? What's each relationship?
4. **What I'm working on right now**: active projects, codenames, what's pressing this week
5. **My routines**: weekly cadence, recurring meetings, typical work hours
6. **How I communicate**: tone, signing conventions, how I like emails and messages written, who I write differently for
7. **How I want to use AI**: what kinds of tasks I want help with (writing, research, planning, decisions, code, scheduling, something else?), and how comfortable I am with AI generally. Am I new to this, or have I been using AI tools daily for a while? **Important**: use this answer to calibrate how you explain things for the rest of the conversation and every conversation after. If I'm new, skip jargon and check in on understanding. If I'm technical, don't over-explain.
8. **What matters right now**: big-picture goals, what I'm excited about, what I'm stressed about
9. **Preferences and peeves**: anything you should always do or never do

A title like "president" does not tell you what someone actually does day to day. Ask.

End the interview with: *"Is there anything else you want me to remember about you, the people you work with, or what you're building?"*

### Save as you go, not at the end

Every time I tell you something substantive, save it **immediately**. Don't batch until the end: if I get interrupted and close the window, what you already saved is safe.

Use **both** save tools, side by side, on the same piece of information:

1. **`memory_save_fact`** for the durable structured claim: the atomic record a future query should match cleanly ("who is Alex's partner", "where does Alex live", "what does Alex do for work").
   - `title`: noun-phrase form, e.g. *"Alex's partner is Jordan Tremblay"*
   - `content`: the claim plus tight context: full names, relationships, dates, anything specific
   - `fact_type`: pick the closest of `relationship` · `preference` · `convention` · `context` · `decision` · `insight`
   - `importance`: see the table below
   - `tags`: 5-10 lowercase-hyphenated keywords

2. **`memory_save`** for the conversation turn that surfaced the claim: the texture future searches might want when the bare fact doesn't match.
   - `user_request`: short paraphrase of what I just told you
   - `agent_response`: rich detail in full sentences: what I said, how I said it, any side context that came up
   - `importance`: see the table below

### Importance guide

| Importance | What it's for                                                       |
|-----------:|---------------------------------------------------------------------|
|       9-10 | Identity, immediate family, partner, kids, core preferences I want recalled on every conversation forever |
|        7-8 | Active work context, current projects, key collaborators, strongly-held conventions ("always sign emails with my first name only") |
|        5-6 | Routine context: tools, occasional collaborators, soft preferences. Baseline for ordinary turns. |
|        3-4 | Footnotes, asides, anything saved for completeness                  |

Importance is a soft ranking preference, not a gate. Even importance=3 hits surface easily. The point is to mark **what's structurally most important** so it ranks first when the reranker considers two hits equally relevant.

**Standing rules: the one place importance IS a gate.** A fact whose `fact_type` is `preference` or `convention` and whose `importance` is 8 or higher is promoted to a *standing rule*: from then on its **title** is injected into every future conversation by `memory_init`, before either of us has said a word. So for those: write the title as the rule itself ("Always quote prices in Canadian dollars"), because the title is all a future conversation sees; keep them few (the boot card has a budget of about 60 and every rule costs context on every turn); and the server refuses the promotion unless you pass `human_confirmed=true`, so ask me explicitly ("should this be a standing rule?") before saving one at 8+. A strongly-held preference that only matters once a topic comes up belongs at 7: still fully searchable, off the boot card.

## Part two: about *you* as my assistant (this does NOT go into memory)

Once the memory interview feels complete, switch modes. Ask me a few questions about how I want **you** to show up for me. These answers are different: they belong in my AI's custom instructions (the same place I pasted the memory instructions earlier), not in my memory. **Do not call `memory_save` for this part.** Keep the answers in the conversation only.

Ask:

- Do you want me to have a name? Something other than "Claude" / "ChatGPT" / whatever default I'm using?
- How should I write to you? Formal, casual, warm, terse, playful, professional: any adjectives that describe your ideal assistant?
- Any quirks you like? (e.g. "sign off with a short tagline", "no fluff, get to the point", "call me out when I'm wrong")
- Any tone to avoid? (e.g. "don't be sycophantic", "skip the disclaimers", "don't apologize unless you actually broke something")

Once I've answered, produce a short identity block I can paste into my custom instructions. Keep it tight: 5-10 lines max. Present it like:

> "Great. Here's a short identity block you might want to add to your custom instructions, alongside the memory instructions:
>
> ```
> ## About you as my assistant
> - Your name is {name or "no fixed name"}
> - Tone: {adjectives from me}
> - {specific behavioral notes, one per line}
> ```
>
> You're not required to paste this: the memory alone will work, but it's what makes future conversations feel like *yours*."

## When both parts are done

Tell me:

> "We're done. I've saved your identity, the people in your life, your current work, and how you want me to show up, both as durable facts (so they rank first on every future query) and as the conversation that surfaced them (so the texture is recoverable).
>
> If you want to spot-check what landed, open the CortexMind dashboard: in the menu bar or tray icon, choose Open Dashboard, and sign in with the CortexMind password from the Connect tab of the settings."

Sign off warmly. You don't need to save a final summary: you already saved as you went.
