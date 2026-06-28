# Cosmos game tree

Current player progression as implemented in the repo. The formal **progression graph** (`src/data/progression/`) sits on top of the original hub-and-spoke age network.

**Related:** [content-authoring.md](./content-authoring.md) · [progression-backlog.md](./progression-backlog.md) · [historical-earth-view.md](./historical-earth-view.md) *(planned)*

---

## 1. World network (ages + puzzle gates)

All ages link back to **Grove** (always unlocked). Other ages unlock only after their puzzle is solved.

```mermaid
flowchart TB
  subgraph hub [Hub — always unlocked]
    Grove["Grove — Plato's Grove\nPresent era"]
  end

  subgraph spokes [Puzzle-gated ages]
    Alex["Alexandria ~300 BCE"]
    Rome["Rome ~250 CE"]
    Desert["Desert ~200 CE"]
  end

  Grove -->|"puzzle-hermetic-rings\n(R at Hermetic stone)"| Alex
  Grove -->|"puzzle-plotinus-stance\n(liminal + hold still)"| Rome
  Grove -->|"puzzle-gnostic-era\n(witness Christianity in cosmic)"| Desert

  Alex -->|portal| Grove
  Rome -->|portal| Grove
  Desert -->|portal| Grove
```

| Puzzle | Type | Trigger | Unlocks |
|--------|------|---------|---------|
| `puzzle-hermetic-rings` | ring-alignment | **R** near Hermetic stone | Alexandria |
| `puzzle-plotinus-stance` | threshold-stance | Liminal phase + hold still at Plotinus stone | Rome |
| `puzzle-gnostic-era` | era-witness | Witness `christianity` in cosmic timeline | Desert |

---

## 2. Formal progression graph (save v3)

Persisted fields: `choiceHistory`, `completedProgressNodeIds`, `pathFlags`, `activePathId`, `revealedMarkerIds`.

Only the **Grove Hermetic arc** is defined today (`src/data/progression/nodes/grove-hermetic.ts`).

```mermaid
flowchart TB
  Start([New game]) --> GroveAvail[Grove initiation available]

  GroveAvail -->|"T — talk to Scholarch"| GroveInit[initiation-grove]
  GroveInit --> PlatonicQuiz{"Platonic quiz\noral vs written?"}
  PlatonicQuiz -->|"no (correct)"| GroveSteps[walk + stillness]
  PlatonicQuiz -->|"yes"| PlatonicQuiz

  GroveSteps --> HermeticFork{"Hermetic fork\nhermetic-rational\nor hermetic-experiential"}

  GroveInit -->|"initiation completed"| NodeIntro["NODE: grove-hermetic-intro\nHermetic threshold"]

  HermeticFork -->|"hermetic-rational\n(persisted choice)"| NodeRat["NODE: grove-choice-rational\nRational inquiry"]
  HermeticFork -->|"hermetic-experiential\n(persisted choice)"| NodeExp["NODE: grove-choice-experiential\nExperiential ascent"]

  NodeIntro --> NodeRat
  NodeIntro --> NodeExp

  NodeRat --> EffRat["Effects:\n• reveal grove-rosicrucian marker\n• path flag: rational\n• journal: Correspondence in symbol"]
  NodeExp --> EffExp["Effects:\n• path flag: experiential\n• grove-experiential-practice\n• journal: Correspondence in breath"]

  EffRat --> Converge
  EffExp --> Converge

  Converge["NODE: grove-hermetic-convergence\nAlexandria correspondence\n(either path flag set)"]

  Converge --> PuzzleAlex["puzzle-hermetic-rings → Alexandria"]
```

### Progress nodes (current)

| Node ID | Title | Requires | Effects |
|---------|-------|----------|---------|
| `grove-hermetic-intro` | Hermetic threshold | Grove initiation completed | — |
| `grove-choice-rational` | Rational inquiry | Intro + choice `hermetic-rational` | Reveal Rosicrucian marker, path `rational`, journal entry |
| `grove-choice-experiential` | Experiential ascent | Intro + choice `hermetic-experiential` | Path `experiential`, practice flag, journal entry |
| `grove-hermetic-convergence` | Alexandria correspondence | Path flag `grove-hermetic-path` set | — (puzzle gate still separate) |

---

## 3. Per-age loop

Same pattern in Grove, Alexandria, Rome, and Desert:

```mermaid
flowchart LR
  subgraph ageLoop [Per age]
    Locked[Age locked] -->|travel / puzzle unlock| Arrive[Arrive in age]
    Arrive --> InitAvail[Initiation available]
    InitAvail -->|"T — NPC guide"| InitQuest[Initiation quest]
    InitQuest --> InitDone[Initiation completed]

    InitDone --> Stones[Mystery stones visible]
    Stones -->|"E"| Discover[Discover event text]
    Stones -->|"Q hold ~12s"| Practice[Practice → resonance ↑]
    Practice --> Realm[realm: material → liminal → spiritual]

    InitDone --> Puzzles[Puzzles + portals visible]
    Puzzles -->|"R / stance / era witness"| PuzzleDone[Puzzle completed]
    PuzzleDone --> PortalOpen[Portal unlocked]
    PortalOpen -->|"F travel"| NextAge[Another age]
  end
```

| Age | NPC | Initiation | Markers | Puzzle from Grove |
|-----|-----|------------|---------|-------------------|
| Grove | Scholarch | Platonic + Hermetic fork | 6 (1 hidden until rational path) | Hermetic rings → Alexandria |
| Alexandria | Serapeum Keeper | Hermetic purification | 3 | — |
| Rome | Plotinus disciple | Neoplatonic ascent | 2 | Plotinus stance → Rome |
| Desert | Anchorite | Gnostic threshold | 2 | Gnostic era → Desert |

---

## 4. Parallel vertical tracks

Not wired into `ALL_PROGRESS_NODES` yet — they run alongside the age tree:

```mermaid
flowchart TB
  Practice[Practice at stones\nresonance + sessions] --> Depth[spiritualDepth ↑]

  Depth --> Esoteric["Tab — esoteric layer\n(depth ≥ 0.35)"]
  Depth --> Correspondence["Correspondence sky\ncosmic view reward"]
  Depth --> Split["J — Quantum split\nesoteric + spiritual phase"]

  subgraph knowledgeModes [Knowledge modes — mostly display today]
    E["E discover → rational"]
    Q["Q practice → experience → gnosis"]
    Faith[Faith track / exoteric events]
  end

  Discover[E at stone] --> E
  Practice --> Q
```

Tradition gates (`src/core/traditionGates.ts`) affect **correspondence sky**, not which ages or progress nodes unlock.

---

## 5. End-to-end player journey

```mermaid
flowchart TD
  Intro[Skip intro] --> Cosmic[Cosmic exploration]
  Cosmic --> Walk[Zoom to human scale → walk mode]

  Walk --> GrovePath[Grove only at first]
  GrovePath --> InitGrove[Complete Grove initiation]
  InitGrove --> Branch{Hermetic fork}

  Branch -->|Rational| RatMarker[Rosicrucian stone appears]
  Branch -->|Experiential| ExpPractice[Experiential practice flag]

  RatMarker --> PracticeAll[Discover E + Practice Q at stones]
  ExpPractice --> PracticeAll

  PracticeAll --> Puzzle1[Solve Hermetic rings puzzle]
  Puzzle1 --> Alex[Travel to Alexandria]
  Alex --> InitAlex[Alexandria initiation]
  InitAlex --> MorePuzzles[Return to Grove — Rome / Desert puzzles]

  PracticeAll --> PathUI[Path panel — completed nodes]
  PracticeAll --> Journal[Journal — path milestones + entries]
```

---

## Not in the tree yet

Planned in [progression-backlog.md](./progression-backlog.md), not implemented as progress nodes:

- Alexandria / Rome / Desert initiation branches
- Kabbalah path from Grove Zohar stone
- Convergence node → puzzle hint journal entries
- New ages (Byzantium, Cordoba, etc.)
- Post-initiation NPC dialogue trees
- Knowledge-mode gates on specific nodes

---

## Key source files

| System | Location |
|--------|----------|
| Progress nodes | `src/data/progression/` |
| Evaluator | `src/core/progression/evaluateProgress.ts` |
| Save v3 | `src/core/save/saveSchema.ts` |
| Ages + puzzles | `src/data/ages/` |
| Initiations | `src/data/initiations/` |
| Path UI | `src/ui/PathPanel.tsx` |
