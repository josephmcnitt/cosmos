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
      {
        type: 'journalEntry',
        title: 'Next: Hermetic rings',
        body: 'Walk south-west to the teal Hermetic Corpus stone. Golden rings float above it — press R to rotate the sequence and open the Alexandria portal.',
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
      { type: 'revealMarker', markerId: 'grove-pythagorean', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'Correspondence in breath',
        body: 'The Pythagorean mysteries answer the experiential path — number, breath, and stance teach the microcosm to mirror the macrocosm.',
      },
      {
        type: 'journalEntry',
        title: 'Next: Hermetic rings',
        body: 'After practice at the teal Hermetic stone, align the floating rings with R. The sequence opens the path to Alexandria.',
      },
    ],
  },
  {
    id: 'grove-hermetic-rings',
    title: 'Hermetic ring sequence',
    tradition: 'hermetic',
    requires: [
      { type: 'pathFlag', flag: 'grove-hermetic-path' },
      { type: 'puzzleCompleted', puzzleId: 'puzzle-hermetic-rings' },
    ],
    effects: [
      {
        type: 'journalEntry',
        title: 'Portal to Alexandria',
        body: 'The Hermetic correspondence holds. Step through the portal at the Hermetic stone when you are ready to travel.',
      },
    ],
  },
  {
    id: 'grove-hermetic-convergence',
    title: 'Alexandria correspondence',
    tradition: 'hermetic',
    requires: [
      { type: 'nodeCompleted', nodeId: 'grove-hermetic-rings' },
      { type: 'ageVisited', worldId: 'alexandria' },
    ],
    effects: [
      {
        type: 'journalEntry',
        title: 'Further paths',
        body: 'Alexandria answered one correspondence. Return to the Grove for Plotinus (stillness) and Gnostic texts (era witness) — each opens another Age.',
      },
    ],
  },
];
