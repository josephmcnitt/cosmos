# Bug Catcher

Manual QA session recorder for Cosmos. Opens the app in a headed Chromium window, overlays a **movable panel** for typing issues as you explore, and saves rich artifacts for each logged bug.

## Quick start

1. Start the dev server (or use `--serve dev`):

   ```bash
   dev.cmd
   ```

2. In another terminal:

   ```bash
   # PowerShell blocks npm.ps1 on many Windows setups — use one of these:
   bug-catch.cmd
   bug-catch.cmd -- --serve dev

   # Or call npm.cmd directly:
   "C:\Program Files\nodejs\npm.cmd" run bug-catch -- --serve dev
   ```

3. Use the app normally. When something looks wrong:
   - Type a short note in the panel
   - Click **Log issue** or press **Ctrl+Enter**
   - Drag the panel by its header if it’s in the way

4. Click **End session** (or close the browser) when finished.

Output lands in `bug-sessions/<timestamp>/`.

## What gets captured per issue

| File | Contents |
|------|----------|
| `note.txt` | Your description |
| `before.png` | Viewport screenshot from ~2.5s before you logged (rolling buffer) |
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
npm run bug-catch -- --url http://127.0.0.1:5173
npm run bug-catch -- --serve dev          # start vite if URL is down
npm run bug-catch -- --serve preview      # build preview on :4173
npm run bug-catch -- --out ./my-sessions
```

Environment:

- `COSMOS_BUG_CATCH_URL` — default URL if `--url` is omitted

Windows shortcut: double-click `bug-catch.cmd` (expects dev server already running).

## Analyze sessions

After a session, turn raw captures into structured triage output:

```bash
bug-analyze.cmd --write --open
```

This writes to the latest session folder:

| File | Purpose |
|------|---------|
| `ANALYSIS.md` | Per-issue summary with HUD state, errors, actions, artifact paths |
| `AGENT_PROMPT.md` | Paste-ready prompt for Cursor with repro context |
| `report.html` | Visual report — before/after/canvas screenshots side by side |

Other commands:

```bash
bug-analyze.cmd --list
bug-analyze.cmd --session 2026-06-25T19-40-09-455Z
bug-analyze.cmd --prompt --issue 003
bug-analyze.cmd --json
```

Analysis extracts Cosmos HUD state from `page.html` (heaven phase, spatial band, timeline position, walk mode, etc.), computes before→after pixel delta, and filters the session timeline down to meaningful clicks/keys.

## Tips

- Log issues **as soon as** you notice them — the rolling `before.png` is most useful when you capture quickly.
- Minimize the panel with **−** if you only need a sliver of screen space.
- Paste paths from `REPORT.md` or attach the whole issue folder when filing bugs or prompting an agent.
