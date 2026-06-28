import type { ProgressNodeDef } from '../types';

export const ALEXANDRIA_WORLD_POLISH_NODES: ProgressNodeDef[] = [
  {
    id: 'alexandria-library-purification-dialogue',
    title: 'Serapeum colonnade counsel',
    tradition: 'hermetic',
    requires: [{ type: 'initiationCompleted', worldId: 'alexandria' }],
    effects: [
      { type: 'setPathFlag', flag: 'alexandria-purified-library-dialogue', value: true },
      {
        type: 'journalEntry',
        title: 'Serapeum colonnade',
        body: 'The Keeper points beyond the first hall: the library stacks themselves form a Hermetic lesson after purification.',
      },
    ],
  },
];
