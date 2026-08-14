# Progression backlog

Prioritized content for daily Tree Author and World Builder automations. Mark items `[done]` when merged.

## Tree arcs (priority order)

1. [done] **Grove Hermetic fork** — `grove-choice-rational` / `grove-choice-experiential` (vertical slice)
2. [done] **Grove experiential reveal parity** — `grove-choice-experiential` reveals hidden `grove-pythagorean` (`pythagorean-mysteries`) in `grove`; Vitest effect/gating + E2E divergent save-state assertions in `progression-path.spec.ts` (marker visibility asserted via `revealedMarkerIds`, matching the rosicrucian pattern)
3. [done] **Alexandria purification branch** — extend `initiation-alexandria` with correspondence vs silence path
4. **Rome ascent branch** — Plotinus inward vs outward dispersion (extend Rome initiation)
5. **Desert gnostic branch** — authority vs inward revelation (extend Desert initiation)
6. [done] **Kabbalah path from Grove** — full arc in `nodes/kabbalah-path.ts`: practice at the `zohar` stone opens PaRDeS (hidden `grove-pardes` stone); the new **gematria** puzzle type (`puzzle-zohar-gematria`, echad/ahavah = 13+13 = the Name) opens the **Safed** age; Safed initiation + practice → tikkun; the Saturn-square gematria opens **Cologne** (Agrippa's occult library, three worlds); `kabbalah-overflow-mirror` joins the shattering of the vessels to the Via's Overflow when both arcs complete. Tests: `kabbalah-path.test.ts`, gematria integrity in `puzzleIntegrity.test.ts`, agent-playtest `kabbalah-gematria`
7. **Convergence: Alexandria portal** — tie `grove-hermetic-convergence` to puzzle hint journal entries
8. [done] **Via Resonantiae ultimate arc** — Five Libers + Silent Gate hidden markers in Grove; cross-age depth gate; tests in `via-resonantiae.test.ts`
9. [done] **Via Resonantiae Liber VI capstone** — Book of Dimensions (Ladder + Overflow parable) after Silent Gate; journal directs player to scrub back to the Big Bang; tests in `via-resonantiae.test.ts`
10. [done] **Witnessing the Overflow** — after Liber VI, deliberately scrubbing the cosmic timeline back into the Big Bang replay (armed by first standing past the first stars) sets `overflow-witnessed`, completes `via-resonantiae-overflow`, seals the path (`via-resonantiae-complete`), and shows the Amen Resonantiae banner; `src/core/overflowWitness.ts`, `src/ui/OverflowWitness.tsx`; tests in `overflowWitness.test.ts`, `via-resonantiae.test.ts`, agent-playtest `overflow-witness`

## World polish

1. **Grove** — bench rendering along stoa path; second NPC (rationalist scribe) near library column
2. **Alexandria** — expand `siteHalfSize` to 32; add `library-block` preset cluster
3. **Rome** — villa courtyard fountain preset; expand neoplatonic veil geometry
4. **Desert** — cave mouth scenery depth; anchorite second dialogue after gnostic path flag
5. [done] **Desert spiritual marker pass** — scope `desert`: wire the "Desert fathers echo" marker to `desert-fathers` without breaking `puzzle-gnostic-era` witness `christianity`; tests: Vitest age registry/event-id validation, E2E only if marker interaction changes

## New ages / time periods (later)

- [done] **Byzantium** (~500 CE) — neoplatonism preservation hub
- [done] **Cordoba** (~900 CE) — translation movement, rational/faith crossover

## Test reminders

Every item must ship Vitest + E2E per [content-authoring.md](./content-authoring.md).
