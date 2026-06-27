import type { ProgressNodeDef } from '../types';

/** Hermetic fork in the Grove — rational inquiry vs experiential ascent. */
export const GROVE_HERMETIC_NODES: ProgressNodeDef[] = [
  {
    id: 'grove-hermetic-intro',
    title: 'Hermetic threshold',
    tradition: 'hermetic',
    requires: [{ type: 'initiationCompleted', worldId: 'grove' }],
    effects: [],
  },
  {
    id: 'grove-choice-rational',
    title: 'Rational inquiry',
    tradition: 'hermetic',
    knowledgeMode: 'rational',
    requires: [
      { type: 'nodeCompleted', nodeId: 'grove-hermetic-intro' },
      { type: 'choiceMade', initiationId: 'initiation-grove', choiceId: 'hermetic-rational' },
    ],
    effects: [
      { type: 'setActivePath', pathId: 'hermetic-rational' },
      { type: 'setPathFlag', flag: 'grove-hermetic-path', value: 'rational' },
      { type: 'revealMarker', markerId: 'grove-rosicrucian', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'Correspondence in symbol',
        body: 'The Rosicrucian manifestos hint that hidden wisdom may be read in text and emblem — as above, so below, inscribed.',
      },
    ],
  },
  {
    id: 'grove-choice-experiential',
    title: 'Experiential ascent',
    tradition: 'hermetic',
    knowledgeMode: 'experience',
    requires: [
      { type: 'nodeCompleted', nodeId: 'grove-hermetic-intro' },
      { type: 'choiceMade', initiationId: 'initiation-grove', choiceId: 'hermetic-experiential' },
    ],
    effects: [
      { type: 'setActivePath', pathId: 'hermetic-experiential' },
      { type: 'setPathFlag', flag: 'grove-hermetic-path', value: 'experiential' },
      { type: 'setPathFlag', flag: 'grove-experiential-practice', value: true },
      {
        type: 'journalEntry',
        title: 'Correspondence in breath',
        body: 'Practice at the Hermetic stone will answer sooner — the microcosm learns to mirror the macrocosm through stance, not argument alone.',
      },
    ],
  },
  {
    id: 'grove-hermetic-convergence',
    title: 'Alexandria correspondence',
    tradition: 'hermetic',
    requires: [
      {
        type: 'pathFlag',
        flag: 'grove-hermetic-path',
      },
    ],
    effects: [],
  },
];
