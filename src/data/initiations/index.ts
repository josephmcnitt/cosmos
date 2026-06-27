import type { InitiationDefinition, InitiationStep } from '../../core/initiation/types';

export const INITIATION_GROVE: InitiationDefinition = {
  id: 'initiation-grove',
  worldId: 'grove',
  title: 'Initiation into the Academy Grove',
  steps: [
    {
      type: 'dialogue',
      speaker: 'The Scholarch',
      text: 'You come to the grove as many came to Athens: with questions. Before any oral teaching, Plato\'s inner circle practiced dialectic and geometry. We begin with a single question.',
    },
    {
      type: 'choose',
      text: 'Can the highest truth be written down without loss?',
      options: [
        { id: 'yes', label: 'Yes — truth lives in books' },
        { id: 'no', label: 'No — the deepest teaching is oral', correct: true },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'The Scholarch',
      text: 'So the ancients report. Walk to the old olive tree. There the unwritten doctrines were whispered, not inscribed.',
    },
    {
      type: 'walk-to',
      text: 'Walk to the olive tree.',
      targetX: -8,
      targetZ: 2,
      radius: 3,
    },
    {
      type: 'hold-still',
      text: 'Stand still. Listen without demanding an answer.',
      durationSec: 8,
    },
    {
      type: 'dialogue',
      speaker: 'The Scholarch',
      text: 'Mathematics is the ladder; the One is the summit. You may now perceive what was always here — if you are ready to discover and to practice.',
    },
  ],
  completionJournal: {
    title: 'Academy initiation',
    body: 'Received into the oral tradition of the grove. Mystery stones may now be approached.',
  },
};

export const INITIATION_ALEXANDRIA: InitiationDefinition = {
  id: 'initiation-alexandria',
  worldId: 'alexandria',
  title: 'Hermetic purification',
  steps: [
    {
      type: 'dialogue',
      speaker: 'Keeper of the Serapeum',
      text: 'In Alexandria, Greek and Egyptian wisdom meet. The Hermetica teach: as above, so below. First, purification — not every name should be spoken aloud.',
    },
    {
      type: 'silence',
      text: 'Remain silent. Do not speak the divine names carelessly.',
      durationSec: 5,
    },
    {
      type: 'face-direction',
      text: 'Turn to face the rising Sun — the east.',
      targetYaw: Math.PI / 2,
      tolerance: 0.6,
    },
    {
      type: 'hold-still',
      text: 'Hold still. Feel the microcosm mirror the macrocosm.',
      durationSec: 10,
    },
    {
      type: 'choose',
      text: 'What is the Hermetic key?',
      options: [
        { id: 'power', label: 'Power over others' },
        { id: 'correspondence', label: 'As above, so below', correct: true },
      ],
    },
  ],
  completionJournal: {
    title: 'Hermetic initiation',
    body: 'Purified and oriented. Correspondence may now be studied in the scrolls and stones.',
  },
};

export const INITIATION_ROME: InitiationDefinition = {
  id: 'initiation-rome',
  worldId: 'rome',
  title: 'Neoplatonic ascent',
  steps: [
    {
      type: 'dialogue',
      speaker: 'Disciple of Plotinus',
      text: 'Plotinus taught orally — Porphyry preserved his words. The soul must withdraw from what disperses it toward outward things.',
    },
    {
      type: 'choose',
      text: 'What must the philosopher turn from first?',
      options: [
        { id: 'outward', label: 'The dispersing outward senses', correct: true },
        { id: 'inward', label: 'The inner voice of conscience' },
      ],
    },
    {
      type: 'walk-to',
      text: 'Walk to the center of the villa courtyard.',
      targetX: 0,
      targetZ: 0,
      radius: 2.5,
    },
    {
      type: 'hold-still',
      text: 'Stand in katharsis — purification through stillness.',
      durationSec: 12,
    },
    {
      type: 'face-direction',
      text: 'Turn inward, away from the outer wall — toward the garden.',
      targetYaw: 0,
      tolerance: 0.8,
    },
    {
      type: 'dialogue',
      speaker: 'Disciple of Plotinus',
      text: 'The One beyond being cannot be grasped as an object. You may now approach the stones of ascent.',
    },
  ],
  completionJournal: {
    title: 'Neoplatonic initiation',
    body: 'Purified for contemplative ascent. The threshold mysteries are unveiled.',
  },
};

export const INITIATION_DESERT: InitiationDefinition = {
  id: 'initiation-desert',
  worldId: 'desert',
  title: 'Gnostic threshold',
  steps: [
    {
      type: 'dialogue',
      speaker: 'The Anchorite',
      text: 'The spark sleeps in matter. Gnostic texts speak of gnosis — knowledge that frees, not authority that binds.',
    },
    {
      type: 'choose',
      text: 'The spark sleeps in matter. Do you seek it?',
      options: [
        { id: 'authority', label: 'I seek the authority of the church' },
        { id: 'inward', label: 'I turn inward for revelation', correct: true },
      ],
    },
    {
      type: 'walk-to',
      text: 'Walk to the cave mouth.',
      targetX: -4,
      targetZ: -10,
      radius: 3.5,
    },
    {
      type: 'silence',
      text: 'The light is not of the sun. Wait in silence.',
      durationSec: 6,
    },
    {
      type: 'dialogue',
      speaker: 'The Anchorite',
      text: 'What you seek cannot be given by another. The hidden texts may now be found.',
    },
  ],
  completionJournal: {
    title: 'Gnostic initiation',
    body: 'Crossed the desert threshold. Inner revelation may guide you to the stones.',
  },
};

export const ALL_INITIATIONS: InitiationDefinition[] = [
  INITIATION_GROVE,
  INITIATION_ALEXANDRIA,
  INITIATION_ROME,
  INITIATION_DESERT,
];

export function getInitiationById(id: string): InitiationDefinition | undefined {
  return ALL_INITIATIONS.find((i) => i.id === id);
}

export function getInitiationForWorld(worldId: string): InitiationDefinition | undefined {
  return ALL_INITIATIONS.find((i) => i.worldId === worldId);
}

export function getStep(def: InitiationDefinition, index: number): InitiationStep | undefined {
  return def.steps[index];
}
