# Cosmos

Multi-scale visual exploration: zoom from the universe to an individual, scrub history from the Big Bang to the present, and control time playback.

## Stack

- TypeScript + Vite + React
- Three.js via React Three Fiber
- Zustand for observer/simulation state

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

## Project layout

```
src/
  core/       ScaleSpace, TimeSpace, SimulationClock, ObserverState
  camera/     LogarithmicCamera
  world/      Scale-band placeholder visuals
  ui/         HUD, zoom, and time controls
```
