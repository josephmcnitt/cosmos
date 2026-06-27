# Bug Catcher

Manual QA and **playtest** session recorder for Cosmos. Opens the app in a headed Chromium window with a **movable panel** for notes while exploring.

PowerShell does not run `dev.cmd` or `npm` from the current folder without a prefix. Use `.\dev.cmd`, `.\bug-catch.cmd`, etc., or call `"C:\Program Files\nodejs\npm.cmd"` directly.

## Two modes

| Mode | Command | For |
|------|---------|-----|
| **QA** (default) | `.\bug-catch.cmd` | You — bug-focused, minimal UI |
| **Guidance** | `.\playtest.cmd` | New players — friendly guide, feedback categories, wrap-up |

## Quick start (QA — your own testing)

One command — starts the dev server automatically if needed:

```bash
.\bug-catch.cmd
```

Or run the app yourself first (`.\dev.cmd`) then `.\bug-catch.cmd -- --serve none`.

## Quick start (Guidance — hand to a new player)

```bash
.\playtest.cmd -- --player "Alex"
```

Starts dev automatically if `:5173` is down.

The panel shows:

- A **Quick guide** (controls cheat sheet — collapsible)
- **Category** per note: confused, bug, suggestion, liked, general
- **Save note** instead of “Log issue”
- **Finish session** → optional overall wrap-up

Same screenshots and artifacts are captured for every note.

Output lands in `bug-sessions/<timestamp>/` (session.json records `mode: "guidance"` and optional `playerName`).

## What gets captured per issue

| File | Contents |
|------|----------|
| `note.txt` | Your description |
| `before.png` | Canvas/viewport snapshot from debounced activity (qa) or at log time (guidance) |
| `after.png` | Full-page screenshot at log time |
| `canvas-after.png` | WebGL canvas crop (when present) |
| `page.html` | DOM snapshot |
| `console.log` | Browser console since the previous issue |
| `page-errors.log` | Uncaught JS errors since the previous issue |
| `network.log` | Failed requests and HTTP 4xx/5xx since the previous issue |
| `meta.json` | URL, viewport, recent clicks/keys/navigation |

The session folder also includes `session.json` (full activity timeline) and `REPORT.md` (human-readable summary).

## Options

```bash
.\bug-catch.cmd -- --mode qa              # default
.\playtest.cmd                            # same as --mode guidance
.\bug-catch.cmd -- --mode guidance --player "Sam"
.\bug-catch.cmd -- --url http://127.0.0.1:5173
.\bug-catch.cmd -- --serve dev
.\bug-catch.cmd -- --out ./my-sessions
```

Environment:

- `COSMOS_BUG_CATCH_URL` — default URL
- `COSMOS_BUG_CATCH_MODE=guidance` — playtest mode
- `COSMOS_BUG_CATCH_PLAYER` — optional name on session

Windows shortcut: double-click `bug-catch.cmd` (expects dev server already running).

## Analyze sessions

After a session, turn raw captures into structured triage output:

```bash
.\bug-analyze.cmd --write --open
```

This writes to the latest session folder:

| File | Purpose |
|------|---------|
| `ANALYSIS.md` | Per-note summary with HUD state, errors, categories |
| `AGENT_PROMPT.md` | Paste-ready fix prompt (QA sessions) |
| `PLAYTEST_PROMPT.md` | Paste-ready synthesis prompt (guidance sessions) |
| `report.html` | Visual report — before/after/canvas screenshots |

Other commands:

```bash
.\bug-analyze.cmd --list
.\bug-analyze.cmd --session 2026-06-25T19-40-09-455Z
.\bug-analyze.cmd --prompt --issue 003
.\bug-analyze.cmd --json
```

Analysis extracts Cosmos HUD state from `page.html` (heaven phase, spatial band, timeline position, walk mode, etc.), computes before→after pixel delta, and filters the session timeline down to meaningful clicks/keys.

## Tips

- Log issues **as soon as** you notice them — debounced canvas capture updates the before-shot after you interact.
- **HUD blinking during capture?** The old tool polled full-page screenshots every 2.5s; that flashed WebGL and looked like a game bug. Defaults are now canvas-only / on-log. If you still see flicker, use `--capture on-log`.
- Minimize the panel with **−** if you only need a sliver of screen space.
- Paste paths from `REPORT.md` or attach the whole issue folder when filing bugs or prompting an agent.
