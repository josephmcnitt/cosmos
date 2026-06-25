# Future ideas (backburner)

Cosmos stays **geometric and contemplative** for now: abstract stones, liminal/spiritual visuals, text in the detail panel. No embedded players, no in-world video surfaces, no auto-generated MP4s in the main experience.

Items below are **explored but not current product direction**. Revisit when the core walk / discover / practice loop feels complete.

---

## Current direction (keep)

- Visual language: symbolic geometry, tradition colors, subtle realm effects — not photoreal or documentary.
- **E** = discover → read in the detail panel (information).
- **Q** = hold to practice at stones (presence, not content delivery).
- Wikipedia `sourceUrl` links for “learn more” — no third-party media in-app yet.

---

## Generated video export (OpenMontage)

**Status:** Phase 6 scaffold exists (`src/export/`, `VideoBriefExport`, `tools/openmontage/`). Pilot render done locally (Zohar brief → Piper TTS + Remotion). **Not promoted in UX; treat as experimental.**

**Idea:** From the event panel, export a JSON brief + OpenMontage prompt → render a ~45–90s “Cosmos short” (narration, Ken Burns or motion graphics, outro).

**Why backburner:** Fights the geometric aesthetic; pipeline is heavy (OpenMontage sibling repo, FFmpeg, Remotion); quality without paid keys is “text + stock” not mystical.

**If revived:**

- Gate behind discover + optional practice depth (“Receive a vision”).
- Separate brief template for contemplative vs explainer tone.
- Prefer **E-path export** only — never bind to **Q** hold.
- Document one-command local workflow in `tools/openmontage/WORKFLOW.md`.

---

## Embedded / linked educational video (YouTube, etc.)

**Idea:** Curated `videoUrls` per event — embed or thumbnail → YouTube lecture, museum clip, documentary segment.

**Why backburner:** Good for learning, but pulls users out of the world; needs manual curation (auto-search is noisy); licensing if ever clipped into exports.

**If revived:**

- Curate 1–2 vetted links per walk-mode stone (not live API search).
- **Watch** section in `EventDetailPanel` — embed vs external link TBD.
- Do **not** stitch YouTube into exported MP4s without CC-licensed or owned footage.

---

## Voices (narration / TTS)

**Idea:** Spoken narration in-app or in exports — Piper (free/local), OpenAI/ElevenLabs/Google TTS for quality.

**Why backburner:** Walk mode is silent by design; voice changes tone from mystery to podcast.

**If revived:**

- Optional ambient voice at stones after practice threshold (one line from `contemplations.ts`, not full lectures).
- Export pipeline only, or separate “audio guide” mode — not default walk.

---

## Music

**Idea:** Tradition-themed ambient beds, procedural or library (Pixabay, Suno, etc.) in exports or subtle in-world audio.

**Why backburner:** Risk of wallpaper new-age; practice mode benefits from near-silence.

**If revived:**

- Very quiet, diegetic-adjacent layers in spiritual realm only.
- Full music in OpenMontage exports, not in live 3D scene at first.

---

## Graphics (stock, AI, rich 2D)

**Idea:** Beyond geometry — Wikimedia/Pexels stills, FLUX/Imagen scenes, diagrams, title cards in exports; possibly richer 2D art in UI.

**Why backburner:** Stock photos (e.g. Zohar manuscripts) can feel literal vs esoteric; AI gen needs keys and art direction.

**If revived:**

- **In-app:** stay geometric; maybe illustrated tradition glyphs, not photos.
- **Export:** stock for historical events, AI for abstract `visualHint` (“luminous, not literal”).
- OpenMontage `image_attribution.json` pattern for credits.

---

## Four modes of knowledge (Phase 9+)

**Status:** Concept only (2026-06-24). Each mode is a **different unlock path** — not four tabs on the same fact.

Cosmos can treat knowing as four quadrants (communicable × verifiable):

| Mode | Communicable? | Verifiable? | Unlock sketch | In-app expression (draft) |
|------|---------------|-------------|---------------|---------------------------|
| **Rational** | Yes | Yes | Discover esoteric text (**E** at stone), cross-links, sources | Detail panel — summary, body, Wikipedia `sourceUrl` |
| **Faith** | Yes | No | Spiritual track, tradition filters, exoteric narrative | Exoteric events, tradition chips, material↔spiritual cross-links |
| **Experience** | No | Yes (first-person) | Hold **Q** at stone, liminal realm, resonance | Practice overlay, contemplation lines, tradition-colored liminal fog |
| **Gnosis** | No | No | Deep practice → spiritual realm, sustained presence | Floating geometric forms (`SpiritualRealm`), non-propositional shift |

**Design principles:**

- **Different keys, different doors** — rational unlock ≠ gnosis unlock; avoid collapsing all four into one “read the panel” moment.
- **Esoteric discover (E)** opens **rational** knowledge (communicable, citable) — what you screenshot in walk mode today.
- **Gnosis** stays **noncommunicable** — the floating forms and realm shift are the content; no text dump replaces them.
- **Faith** and **experience** get their own progression later (tradition-specific ritual timing, elections, silence thresholds — see astrology section).

**If revived:**

- Tag events and stones with primary `knowledgeMode` where useful.
- UI affordances per mode (panel vs practice vs realm-only).
- Phase 10 tradition modules define accurate unlock rules per stream (Hermetic vs Gnostic vs Kabbalah differ).

---

## Astrology and correspondence sky (Phase 8 / 10)

**Idea:** After meaningful practice at a stone (liminal → spiritual), zoom back out from walk mode and the **same** simulated sky can re-render as an **interpretive / astrological** view — zodiac band, planetary rulers, tradition-specific correspondences — while the material track still shows historical astronomy.

**Status:** Phase 8 MVP + **8.1 shipped** (2026-06-25). Time-driven starfield/fog/ambient in cosmic view; fixed-noon Sun/Moon ephemeris at Earth-scale present. Correspondence lens still deferred.

**Phase 8.1 (shipped):**

1. **`CosmicStarfield` / `CosmicSkySync`** — wire `computeHeavenVisuals()` to drei stars, fog color, ambient (no `fog.far` mutation).
2. **`EphemerisSky`** — Athens observer, 2026-06-21 noon UTC snapshot; gated by `heavenVisibility.isEphemerisBand`.
3. **Tests** — `heavenVisibility`, `ephemeris`, extended `material-heavens` E2E.

**Deferred to Phase 8.1b:** scrubbable Big Bang replay (today intro-only in `BigBangEffect.tsx`).

**Phase 8 MVP (shipped):**

1. **`MaterialHeavens` component** — band meshes from `WorldRoot` when `spatialExponent < 22`.
2. **Time phases from** `src/data/history/cosmic.ts` — map `simTimeSeconds` to visual states.
3. **Shared clock** — subscribe to `useObserverStore` `simTimeSeconds`.
4. **Tests** — Vitest for phase mapping; Playwright heaven phase indicator.

**Phase split:**

| Phase | Scope |
|-------|--------|
| **8 — Material cosmos** | Animated heavens tied to `simTimeSeconds` (structure formation, band meshes). Stays scientific; shared clock for everything else. |
| **8.1 — Sky polish + ephemeris** | Starfield/fog/ambient wiring; fixed-noon Sun/Moon at Earth-scale present (**shipped**). |
| **8.1b — Big Bang replay** | Scrubbable intro effect driven by `simTimeSeconds` (not wall-clock). |
| **8b / early 10 — Correspondence lens** | Unlock astrological sky **after** spiritual depth at a stone; geometric style preserved (glyphs, orbits, color — not horoscope UI chrome). |
| **10 — Tradition-accurate ritual gates** | Per-tradition rules only — not one global zodiac gate. Hermetic/Neoplatonic: planetary hours, elections. Kabbalah: sefirot/time cycles. Gnostic: inner gnosis, not natal chart. Platonic: Timaeus cosmology over horoscope. |

**Design principle:** Astrology is a **reward layer** for contemplative practice, not the universal key to the spiritual realm. Accuracy lives in **tradition modules**, not a single global mechanic.

**If revived:**

- Same `simTimeSeconds` drives both material ephemeris and astrological mapping.
- Spiritual track toggle or auto-switch when exiting walk after deep practice.
- Document sources per tradition (e.g. Hermetica correspondences vs Lurianic time vs Plotinian ascent).

---

## Other candidates (short notes)

| Idea | Note |
|------|------|
| Cosmic trailer export | Whole-journey montage, not per-event |
| Documentary montage pipeline | Real footage, OpenMontage `documentary-montage` |
| Batch export (all stones zip) | Creator / marketing tool |
| Phase 6b+ in plan files | Do not edit plan files; track here instead |

---

## Decision log

| Date | Decision |
|------|----------|
| 2026-06-24 | Keep geometric style; no explicit in-app videos. Generated/embedded video, voices, music, rich graphics → this backburner list. Phase 6 code remains but is not the near-term focus. |
| 2026-06-24 | **Phase 7 shipped:** Vitest unit tests, Playwright E2E, realm transition coordinator, UI polish (era hints, export de-emphasized), richer esoteric copy on five walk stones. |
| 2026-06-24 | **Astrology / correspondence sky** → Phase 8 material heavens first, then interpretive astrological lens after spiritual practice (Phase 8b/10), with per-tradition ritual gates in Phase 10 — not a universal zodiac requirement. |
| 2026-06-24 | **Four modes of knowledge** (rational / faith / experience / gnosis) → distinct unlock paths; E = rational esoteric text; Q + spiritual realm = experience → gnosis (floating forms). Documented for Phase 9+ before implementation. |
| 2026-06-25 | **Years-ago log timeline shipped:** scrub/zoom use log₁₀ years ago (left = Big Bang, right = present) so recent history gets more bar space and mid-timeline labels move with the playhead. |
| 2026-06-25 | **E2E CI runs against local preview** (`vite preview` on port 4173); production smoke optional via `COSMOS_E2E_URL`. Vercel deploy stays build-only (`npm run build`). |
| 2026-06-25 | **Phase 8.1 shipped:** `CosmicStarfield`, `CosmicSkySync`, `EphemerisSky`, `heavenVisibility` gates; fixed-noon Sun/Moon at Athens. Big Bang scrub replay → 8.1b. |
| 2026-06-25 | **Phase 8 MVP shipped:** `MaterialHeavens` maps `simTimeSeconds` to cosmic sky phases (dark ages → first light → reionized); fog/ambient/band opacity multipliers on existing `WorldRoot`. |
