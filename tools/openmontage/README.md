# OpenMontage + Cosmos — Video Export

Cosmos exports **structured video briefs** (JSON) from history events. [OpenMontage](https://github.com/calesthio/OpenMontage) renders them as animated explainers using Cursor as orchestrator.

**OpenMontage is not bundled in Cosmos** (AGPL-3.0). Clone it as a **sibling repository** next to this project.

## Prerequisites

On your machine (for OpenMontage only):

- Python 3.10+
- FFmpeg
- Node.js 18+
- Git

Optional API keys (better images/voices): see [OpenMontage PROVIDERS.md](https://github.com/calesthio/OpenMontage/blob/main/docs/PROVIDERS.md). The **free path** uses Piper TTS + Remotion still-image scenes (~$0).

## Quick start

1. **In Cosmos** — open any event → choose duration (45/60/90s) → **Export video brief**. JSON downloads; prompt copies to clipboard.

2. **Clone OpenMontage** (once):

   ```bash
   cd ..
   git clone https://github.com/calesthio/OpenMontage.git
   cd OpenMontage
   make setup
   ```

3. **Drop the brief** into OpenMontage:

   ```bash
   mkdir -p exports
   cp ~/Downloads/cosmos-zohar-brief.json exports/
   ```

4. **Open OpenMontage in Cursor** and paste the prompt from the brief (or use [`prompts/animated-explainer.txt`](prompts/animated-explainer.txt)).

5. The agent runs the **Animated Explainer** pipeline → final MP4 in `projects/<name>/renders/`.

See [WORKFLOW.md](WORKFLOW.md) for the full step-by-step pilot.

## Example briefs

Pre-generated samples (60s, esoteric events):

- [`examples/zohar-brief.json`](examples/zohar-brief.json)
- [`examples/platonic-academy-brief.json`](examples/platonic-academy-brief.json)

Regenerate from Cosmos source:

```bash
npx vite-node scripts/generate-brief-examples.ts
```

## Brief schema

Cosmos briefs are version `1`, pipeline `animated-explainer`. Each includes:

- `sections[]` — narration, visualHint, onScreenText per beat
- `metadata` — eventId, tradition, cross-links, epoch
- `openMontage.cursorPrompt` — paste-ready for Cursor

Defined in [`src/export/types.ts`](../../src/export/types.ts).

## Cost

| Stack | Approx. cost |
|-------|----------------|
| Piper + Remotion (no keys) | $0 |
| + FLUX / cloud images | ~$0.15–1.50 per video |

## License note

Cosmos (this repo) and OpenMontage are separate projects. Do not copy OpenMontage source into Cosmos; use the export brief as the interface between them.
