# Progression backlog

Prioritized content for daily Tree Author and World Builder automations. Mark items `[done]` when merged.

## Tree arcs (priority order)

1. [done] **Grove Hermetic fork** — `grove-choice-rational` / `grove-choice-experiential` (vertical slice)
2. **Grove experiential reveal parity** — `grove-choice-experiential` should reveal hidden `grove-pythagorean` (`pythagorean-mysteries`) in `grove`; tests: Vitest effect/gating + E2E divergent marker visibility (`marker-grove-pythagorean-visible`)
3. [done] **Alexandria purification branch** — extend `initiation-alexandria` with correspondence vs silence path
4. **Rome ascent branch** — Plotinus inward vs outward dispersion (extend Rome initiation)
5. **Desert gnostic branch** — authority vs inward revelation (extend Desert initiation)
6. **Kabbalah path from Grove** — place `zohar` stone behind tradition gate + progress node
7. **Convergence: Alexandria portal** — tie `grove-hermetic-convergence` to puzzle hint journal entries
8. **Convergence: Rome portal** — scope Plotinus arc in `grove`/`rome`: add `grove-plotinus-convergence` after `puzzle-plotinus-stance` + `ageVisited` `rome`, with journal guidance distinct from future `rome-choice-inward` / `rome-choice-outward`; tests: Vitest unlock/effects + pathNextStep hint, E2E only if portal guidance UI changes

## World polish

1. **Grove** — bench rendering along stoa path; second NPC (rationalist scribe) near library column
2. **Alexandria** — expand `siteHalfSize` to 32; add `library-block` preset cluster
3. **Rome** — villa courtyard fountain preset; expand neoplatonic veil geometry
4. **Desert** — cave mouth scenery depth; anchorite second dialogue after gnostic path flag
5. **Desert spiritual marker pass** — scope `desert`: wire the "Desert fathers echo" marker to `desert-fathers` without breaking `puzzle-gnostic-era` witness `christianity`; tests: Vitest age registry/event-id validation, E2E only if marker interaction changes
6. **Alexandria alchemical alcove** — scope `alexandria`: add `alex-alchemy` marker for `alchemy-golden` near the library stacks, gated by `alexandria-choice-correspondence`; tests: Vitest age registry/event-id validation + marker hidden/reveal gating, E2E only if marker interaction changes (`marker-alex-alchemy-visible`)

## New ages / time periods (later)

- **Byzantium** (~500 CE) — neoplatonism preservation hub
- **Cordoba** (~900 CE) — translation movement, rational/faith crossover

## Test reminders

Every item must ship Vitest + E2E per [content-authoring.md](./content-authoring.md).
