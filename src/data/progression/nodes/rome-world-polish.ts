import type { ProgressNodeDef } from '../types';

export const ROME_WORLD_POLISH_NODES: ProgressNodeDef[] = [
  {
    id: 'rome-villa-courtyard-dialogue',
    title: 'Villa courtyard counsel',
    tradition: 'neoplatonism',
    requires: [{ type: 'initiationCompleted', worldId: 'rome' }],
    effects: [
      { type: 'setPathFlag', flag: 'rome-villa-courtyard-dialogue', value: true },
      {
        type: 'journalEntry',
        title: 'Villa courtyard',
        body: 'The Disciple points to the fountain and its three veils: a small model of descent, return, and inward recollection.',
      },
    ],
  },
];
