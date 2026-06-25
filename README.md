# Cosmos

Multi-scale visual exploration: zoom from the universe to an individual, scrub history from the Big Bang to the present, and control time playback.

## Stack

- TypeScript + Vite + React
- Three.js via React Three Fiber
- Zustand for observer/simulation state
- Vitest (unit) + Playwright (production smoke)

## Getting started

PowerShell may block `npm` scripts. Use either:

```bash
# Option A — double-click or run from cmd/PowerShell:
dev.cmd

# Option B — call npm.cmd directly:
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Opening

The experience begins in black silence (~2.5s), then the Big Bang ignites from the center of view. The explosion expands for ~5s, the cosmos fades in, and controls appear. Click or press any key to skip.

## Controls

- **Mouse wheel** — spatial zoom (universe ↔ human scale)
- **Shift + wheel** — temporal zoom (scrub precision)
- **Timeline scrubber** — jump through cosmic history
- **Play / speed buttons** — advance simulation time
- **`~`** — toggle debug grid overlay
- **Walk mode** — zoom to **Human** scale at **present** era; **E** discover, **Q** hold to practice at mystery stones
- **Spiritual + Full Depth** — required to see esoteric walk stones and their detail

## Phase 7 — polish & testing

Phase 7 stabilizes the discover / practice loop, smooths realm transitions, and adds automated tests.

**Manual checklist**

1. Skip intro → Spiritual track + Full Depth
2. Zoom spatial slider to human scale (exponent ~4)
3. Jump to present if epoch mismatch hint appears
4. Walk with WASD; **E** at a stone opens the detail panel
5. Hold **Q** at a stone to practice (realm shifts material → liminal → spiritual)

**Tests**

```bash
npm test              # Vitest — practice, embodiment, spatial coupling
npm run test:e2e      # Playwright smoke vs production (see below)
npm run test:e2e:ui   # Headed debug
```

E2E defaults to `https://cosmos-puce.vercel.app/` (`COSMOS_E2E_URL` override). Smoke tests validate the **deployed** build; for pre-merge checks, point `COSMOS_E2E_URL` at `npm run preview` locally.

First-time Playwright setup: `npx playwright install chromium`

## Video export (backburner)

Phase 6 export scaffolding remains in `src/export/` and `tools/openmontage/` but is **not** in the default UI. See [FUTURE_IDEAS.md](FUTURE_IDEAS.md) if you want to revive OpenMontage briefs.

## Project layout

```
src/
  core/       ScaleSpace, TimeSpace, ObserverState, practice/realm, realmTransition
  export/     Video brief builder for OpenMontage (experimental)
  camera/     Logarithmic + embodied cameras
  world/      Scale bands, walkable site, liminal/spiritual layers
  ui/         HUD, timeline, event panels
tests/e2e/    Playwright smoke helpers + specs
tools/
  openmontage/  Workflow docs + example briefs
```
