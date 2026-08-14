# Agent Playtest

Autonomous scripted playthroughs for Cosmos — a harness an AI agent (or CI) can run
to actually *play* the game headlessly and capture structured evidence: it walks the
avatar with keyboard input, discovers stones, solves the ring puzzle by pressing R,
holds Q through practice sessions, and scrubs the timeline.

Complements `tools/bug-catcher` (human playtests): same session-folder output style,
but fully self-driving with pass/fail expectations.

## Run

```bash
.\agent-playtest.cmd                 # all scenarios
.\agent-playtest.cmd --scenario ring-puzzle,practice
.\agent-playtest.cmd --list
.\agent-playtest.cmd --headed        # watch it play
```

Server resolution: reuses `127.0.0.1:5173` (dev) or `:4173` (preview) if up,
else starts `vite preview` (requires a prior `npm run build`).

Output: `bug-sessions/agent-<timestamp>/` with `REPORT.md`, `report.json`, and
per-step screenshots. Each step records the observer probe (mode, avatar x/z/yaw),
HUD state (via `tools/bug-catcher/extractHudState`), a save summary (puzzles,
resonance, sessions, ring rotations), console errors, observations, and problems.

## Scenarios

| Name | What it plays | Fails when |
|------|---------------|------------|
| `boot` | Intro skip → cosmic view | HUD indicators missing |
| `walk-discover` | Walk to the Unwritten doctrines stone, press E | Discovery not recorded in save |
| `ring-puzzle` | Walk to the Hermetic stone, press R until aligned | Not solvable within 12 presses (one full rotation cycle) |
| `practice` | Hold Q through two chained sessions | Sessions don't complete, or realm never leaves material |
| `timeline` | Scrub timeline to both extremes | Heaven phase doesn't react |
| `overflow-witness` | Seed Liber VI, scrub back to the Big Bang | Capstone not witnessed/sealed, banner missing, or trigger fires without scrubbing |
| `kabbalah-gematria` | Weigh the letters at the Zohar stone, travel to Safed | PaRDeS doesn't cascade, panel/feedback broken, wrong answer accepted, or travel fails |

## Building blocks (for new scenarios)

- `AgentDriver` (`driver.ts`) — `boot`, `patchSave`/`readSave`, `enterWalkMode`,
  `walkTo(x, z)` (keyboard navigation via `nav.ts` planning against the
  `observer-state-probe` avatar attributes), `press`/`hold`, `snapshot(name)`,
  `readStores()` (live zustand state via the dev-only `window.__cosmos` bridge —
  dev server only, absent in preview builds).
- `findEntityPosition(entityId)` — marker/actor coordinates from the persisted save.
- Add scenarios in `scenarios.ts`; record findings with
  `step.observations.push(...)` / `step.problems.push(...)` — any problem fails
  the scenario and the process exits non-zero.

## Bugs this harness has caught

- Hermetic ring sequence `[0,2,1]` unreachable under the fixed 0→1→2 rotation
  cycle — puzzle unsolvable (now guarded by `src/core/puzzles/puzzleIntegrity.test.ts`).
- Era-witness window (~1585 y) auto-completed Byzantium/Córdoba unlock puzzles
  from the present era on a fresh save.
- Hidden progression markers were valid discovery/practice targets while invisible.
- `extractHudState` realm CSS vars always read the stylesheet default (0), never
  the live inline values.
