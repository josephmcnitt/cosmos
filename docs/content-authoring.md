# Content authoring guide

Conventions for adding progression nodes, world content, and tests in Cosmos.

**Related:** [game-tree.md](./game-tree.md) · [progression-backlog.md](./progression-backlog.md)

## Progression node checklist

1. Define nodes in `src/data/progression/nodes/<arc>.ts`
2. Register in `src/data/progression/index.ts` → `ALL_PROGRESS_NODES`
3. Run registry validation (boot app or `npm test`)
4. Add Vitest in `src/core/progression/progression.test.ts` or `nodes/<arc>.test.ts`
5. Add E2E in `tests/e2e/progression-path.spec.ts` if player-visible branching changes

## New age checklist

1. `src/data/ages/<name>.ts` → register in `src/data/ages/index.ts`
2. Spiritual events for markers in `src/data/spiritual/`
3. Actor in `src/data/actors/index.ts`
4. Initiation in `src/data/initiations/index.ts`
5. Progress nodes linking initiation + puzzles
6. E2E travel smoke in `tests/e2e/age-travel.spec.ts`

## Hidden markers

Add to age def:

```typescript
{ id: 'grove-rosicrucian', eventId: 'rosicrucian', position: [8, 6], label: '...', hiddenUntilNode: 'grove-choice-rational' }
```

Reveal via progress effect `{ type: 'revealMarker', markerId, worldId }`.

## data-testid conventions

| Element | test id |
|---------|---------|
| Path panel toggle | `path-toggle` |
| Completed progress node | `progress-node-<id>-completed` |
| Pending progress node | `progress-node-<id>-pending` |
| Active path label | `path-active-id` |
| Visible walk marker | `marker-<markerId>-visible` |
| Initiation choice | `initiation-choice-<choiceId>` |

## Test-after-addition policy

| Change type | Required tests |
|-------------|----------------|
| New progress node(s) | Vitest: unlock conditions + effects |
| Initiation branch | Vitest: choice → `choiceHistory` → node unlock |
| Branching player path | E2E: divergent save states |
| New age / portal | E2E: age-travel smoke |
| Building / scenery only | Vitest: registry validates age def |
| NPC / dialogue gate | Vitest: spawn/flag; E2E if interaction visible |
| Save schema change | Vitest: migration round-trip |

Use fixtures from `src/core/progression/testFixtures.ts`.

## PR checklist (automations)

1. **Content added** — node ids, ages, markers
2. **Tests added** — file paths + assertions
3. `npm test` + `npm run test:e2e` green

## Geometric aesthetic

Stay symbolic/abstract per [FUTURE_IDEAS.md](../FUTURE_IDEAS.md). No photoreal assets or embedded video.
