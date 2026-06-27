import type { ProgressNodeDef } from '../types';

export const ALEXANDRIA_HERMETIC_NODES: ProgressNodeDef[] = [
  {
    id: 'alexandria-post-init-dialogue',
    title: 'Keeper afterword',
    tradition: 'hermetic',
    requires: [{ type: 'initiationCompleted', worldId: 'alexandria' }],
    effects: [
      { type: 'setPathFlag', flag: 'alexandria-post-init-dialogue-ready', value: true },
      {
        type: 'journalEntry',
        title: 'Keeper afterword',
        body: 'The Keeper points toward the expanded side halls: correspondence is preserved between shelves as much as stars.',
      },
    ],
  },
];
