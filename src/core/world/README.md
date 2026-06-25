# World platform layer

Three state layers:

| Layer | Store | Persists? |
|-------|-------|-----------|
| Observer | `ObserverState` | No — camera, mode, scrub |
| World | `WorldState` | Yes — entities, progression, splits |
| Display | `RealmDisplayState` | No — interpolated visuals |

Add historical places via `src/data/ages/*.ts` + registry entry.
Autonomous agents register with `SimDirector`.
