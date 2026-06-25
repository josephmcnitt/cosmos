import type { PuzzleTemplate } from './types';

export const PUZZLE_TEMPLATES: PuzzleTemplate[] = [
  {
    id: 'puzzle-hermetic-rings',
    type: 'ring-alignment',
    targetAgeId: 'alexandria',
    markerEventId: 'hermetic-corpus',
    ringSequence: [0, 2, 1],
  },
  {
    id: 'puzzle-plotinus-stance',
    type: 'threshold-stance',
    targetAgeId: 'rome',
    markerEventId: 'neoplatonism-plotinus',
  },
  {
    id: 'puzzle-gnostic-era',
    type: 'era-witness',
    targetAgeId: 'desert',
    markerEventId: 'gnostic-gospels',
    witnessEventId: 'christianity',
  },
];
