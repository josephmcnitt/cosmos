import type { ProgressNodeDef } from '../types';

/** Hermetic purification in Alexandria — correspondence in scrolls vs silence in practice. */
export const ALEXANDRIA_PURIFICATION_NODES: ProgressNodeDef[] = [
  {
    id: 'alexandria-purification-intro',
    title: 'Alexandrian purification',
    tradition: 'hermetic',
    requires: [{ type: 'initiationCompleted', worldId: 'alexandria' }],
    effects: [],
  },
  {
    id: 'alexandria-choice-correspondence',
    title: 'Correspondence in scrolls',
    tradition: 'hermetic',
    knowledgeMode: 'rational',
    requires: [
      { type: 'nodeCompleted', nodeId: 'alexandria-purification-intro' },
      {
        type: 'choiceMade',
        initiationId: 'initiation-alexandria',
        choiceId: 'alexandria-correspondence',
      },
    ],
    effects: [
      { type: 'setActivePath', pathId: 'alexandria-correspondence' },
      { type: 'setPathFlag', flag: 'alexandria-purification-path', value: 'correspondence' },
      { type: 'revealMarker', markerId: 'alex-hermetic', worldId: 'alexandria' },
      {
        type: 'journalEntry',
        title: 'Purification by correspondence',
        body: 'The Hermetic scrolls open by likeness: heaven and earth answer one another when the mind learns to read their shared pattern.',
      },
    ],
  },
  {
    id: 'alexandria-choice-silence',
    title: 'Silence before the names',
    tradition: 'hermetic',
    knowledgeMode: 'experience',
    requires: [
      { type: 'nodeCompleted', nodeId: 'alexandria-purification-intro' },
      {
        type: 'choiceMade',
        initiationId: 'initiation-alexandria',
        choiceId: 'alexandria-silence',
      },
    ],
    effects: [
      { type: 'setActivePath', pathId: 'alexandria-silence' },
      { type: 'setPathFlag', flag: 'alexandria-purification-path', value: 'silence' },
      { type: 'revealMarker', markerId: 'alex-plato', worldId: 'alexandria' },
      {
        type: 'journalEntry',
        title: 'Purification by silence',
        body: 'The Platonic echo answers without a name: silence keeps the divine from becoming an object of possession.',
      },
    ],
  },
];
