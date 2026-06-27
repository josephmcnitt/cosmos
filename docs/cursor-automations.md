# Daily Cursor Automations

Set these up in the **Cursor Agents Window → Automations editor** after merging the Game Tree Platform. Each automation runs on the Cosmos repo default branch.

## 1. Tree Author (weekdays 6:00)

- **Schedule:** `0 6 * * 1-5`
- **Instructions:**

Read `docs/progression-backlog.md`. Pick **one** highest-priority tree item not marked `[done]`. Implement: progress node(s), initiation branch or dialogue, any linked spiritual event/marker. **Then add tests** per `docs/content-authoring.md` (Vitest for unlock/effects; E2E if branch changes visible gameplay). Run `npm test` and `npm run test:e2e`. If green, open a PR titled `progression: <node-id>` with a **Tests added** section. Mark item `[done]` in backlog. Do not touch unrelated files.

## 2. World Builder (weekdays 10:00)

- **Schedule:** `0 10 * * 1-5`
- **Instructions:**

Read `docs/progression-backlog.md` world polish section. Pick one age. Enhance: 1–2 building presets or scenery placements, expand terrain if needed, add 1 NPC or post-init dialogue stub wired to a progress flag. **Then add tests:** at minimum registry/age validation Vitest; add E2E if NPC spawn, dialogue gate, or travel is affected. Run `npm test` and `npm run test:e2e`. Open PR `world: <age-id> <short-desc>` with **Tests added** section.

## 3. Integrate & Test (weekdays 18:00)

- **Schedule:** `0 18 * * 1-5`
- **Instructions:**

Fetch open PRs from Tree Author and World Builder (or main if merged). **Reject / request changes** on any PR missing tests for its content (see `docs/content-authoring.md`). Run `npm test` and `npm run test:e2e`. Fix trivial regressions in-place. Summarize in PR comment with test coverage note. Merge only if all green, content-scoped, **and tests are present**.

## Opening the editor

In the Agents Window, ask: *"Create Cursor automations from docs/cursor-automations.md"* — or paste each block into a new automation manually.

## Guardrails

- One arc or one age per PR
- Every PR includes new or updated tests
- Never bump `SAVE_VERSION` without a migration in `src/core/save/migrations.ts`
