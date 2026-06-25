# Cosmos

Multi-scale visual exploration: zoom from the universe to an individual, scrub history from the Big Bang to the present, and control time playback.

## Stack

- TypeScript + Vite + React
- Three.js via React Three Fiber
- Zustand for observer/simulation state
- Vitest (unit) + Playwright (E2E against local preview in CI)

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
- **Timeline scrubber** — jump through cosmic history (log scale in **years ago** — left = Big Bang, right = present; recent history gets more bar space)
- **Play / speed buttons** — advance simulation time
- **`~`** — toggle debug grid overlay
- **Walk mode** — zoom to **Human** scale at **present** era; **E** discover, **Q** hold to practice at mystery stones
- **Spiritual + Full Depth** — required to see esoteric walk stones and their detail

## Phase 7–7.5 — polish, testing, and timeline

Phase 7 stabilizes the discover / practice loop, smooths realm transitions, and adds automated tests. Phase 7.5 fixes CI E2E and documents the **years-ago log timeline** (scrub/zoom use log₁₀ years ago, not seconds since the Big Bang, so mid-timeline labels and the playhead move meaningfully).

**Manual checklist**

1. Skip intro → Spiritual track + Full Depth
2. Zoom spatial slider to human scale (exponent ~4)
3. Jump to present if epoch mismatch hint appears
4. Walk with WASD; **E** at a stone opens the detail panel
5. Hold **Q** at a stone to practice (realm shifts material → liminal → spiritual)
6. On a wide cosmic timeline, scrub left → right — HUD/playhead labels should change (more space for recent history than under the old scale)

**Tests**

```bash
npm test              # Vitest — practice, embodiment, spatial coupling, wheel zoom, time zoom
npm run test:e2e      # Playwright — local preview by default (see below)
npm run test:e2e:ui   # Headed debug
```

Vitest covers wheel routing (`src/core/wheelZoom.test.ts`) and time zoom / years-ago scrub (`src/core/timeZoomBehavior.test.ts`). Playwright includes `tests/e2e/scroll-zoom.spec.ts` and `tests/e2e/time-zoom.spec.ts`.

**E2E vs deploy**

| Where | What runs |
|-------|-----------|
| **GitHub CI** (`CI / e2e`) | `npm run build` + Playwright against **local preview** (`127.0.0.1:4173`) — tests the commit being merged |
| **Vercel** | `npm run build` only — no tests on deploy |
| **Optional prod smoke** | `COSMOS_E2E_URL=https://cosmos-puce.vercel.app npm run test:e2e` |

By default, Playwright starts `vite preview` when `COSMOS_E2E_URL` is unset ([playwright.config.ts](playwright.config.ts)).

First-time Playwright setup: `npx playwright install chromium`

**Next:** Phase 8.1b — scrubbable Big Bang replay. See [FUTURE_IDEAS.md](FUTURE_IDEAS.md).

## Phase 8 — material heavens

Cosmic view sky responds to **timeline scrubbing** via `simTimeSeconds`:

- **Dark ages** (before first stars): dim ambient, heavy fog, sparse starfield
- **First light → reionization**: starfield and galaxy bands ramp up
- **Post-reionization**: full starfield brightness; spatial zoom still cross-fades bands

## Phase 8.1 — sky wiring + ephemeris

- **`CosmicStarfield`** — drei `Stars` opacity follows `computeHeavenVisuals().starfieldOpacity` (floor keeps canvas non-black at dark ages)
- **`CosmicSkySync`** — fog **color** and ambient intensity lerp from heaven visuals; optional CMB background tint; **does not** change `fog.far`
- **`EphemerisSky`** — fixed-noon Sun/Moon snapshot at Athens on 2026-06-21 solstice; visible at human-era present when `6 ≤ spatialExponent < 22`
- **Gates** — `src/core/heavenVisibility.ts` shared by band meshes, ephemeris, and indicators

**Manual check:** skip intro → scrub far left → present; center canvas should dim but not black out. Jump to present → spatial zoom ~12 → ephemeris indicator active; zoom to 25 → inactive.

**Tests:** `materialHeavens.test.ts`, `heavenVisibility.test.ts`, `ephemeris.test.ts`; `tests/e2e/material-heavens.spec.ts` (phase, brightness, ephemeris gates).

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
