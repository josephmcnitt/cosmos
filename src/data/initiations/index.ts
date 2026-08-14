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
      text: 'So the ancients report. Walk to the sacred olive tree — look for the golden glow on the ground.',
    },
    {
      type: 'walk-to',
      text: 'Walk to the sacred olive tree (golden ring on the ground).',
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
      text: 'Mathematics is the ladder; the One is the summit. Before you approach the Hermetic stones, choose your first gate.',
    },
    {
      type: 'choose',
      text: 'The Hermetic stream offers two gates. Which calls to you first?',
      options: [
        {
          id: 'hermetic-rational',
          label: 'Correspondence in text and symbol — rational inquiry',
        },
        {
          id: 'hermetic-experiential',
          label: 'Correspondence in breath and stance — experiential ascent',
        },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'The Scholarch',
      text: 'You may now perceive what was always here — if you are ready to discover and to practice.',
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
      type: 'dialogue',
      speaker: 'Keeper of the Serapeum',
      text: 'Purification opens two ways in this city of scrolls and silence. One studies correspondence; one refuses to spend the divine names too quickly.',
    },
    {
      type: 'choose',
      text: 'Which Alexandrian purification path will you follow?',
      options: [
        {
          id: 'alexandria-correspondence',
          label: 'Read the scrolls for correspondence between heaven and earth',
        },
        {
          id: 'alexandria-silence',
          label: 'Keep silence before the hidden names',
        },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'Keeper of the Serapeum',
      text: 'Chosen rightly, either gate purifies: one by pattern, one by restraint. Now name the key without trying to possess it.',
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

export const INITIATION_BYZANTIUM: InitiationDefinition = {
  id: 'initiation-byzantium',
  worldId: 'byzantium',
  title: 'Preservation of the light',
  steps: [
    {
      type: 'dialogue',
      speaker: 'Monk of the scriptorium',
      text: 'Rome fell in the West, but in Constantinople the Greek texts endure. Plotinus is copied beside the Psalms — philosophy and prayer under one dome.',
    },
    {
      type: 'choose',
      text: 'What must be preserved when empires fall?',
      options: [
        { id: 'power', label: 'Imperial borders and armies' },
        { id: 'texts', label: 'The inner teaching in faithful copy', correct: true },
      ],
    },
    {
      type: 'walk-to',
      text: 'Walk to the columned nave.',
      targetX: 0,
      targetZ: -6,
      radius: 3,
    },
    {
      type: 'hold-still',
      text: 'Stand beneath the dome. Let the light be received, not grasped.',
      durationSec: 10,
    },
    {
      type: 'dialogue',
      speaker: 'Monk of the scriptorium',
      text: 'The stones of ascent remain — copied, guarded, and still alive in Greek.',
    },
  ],
  completionJournal: {
    title: 'Byzantine preservation',
    body: 'Received into the scriptorium tradition. Neoplatonic stones may now be approached.',
  },
};

export const INITIATION_CORDOBA: InitiationDefinition = {
  id: 'initiation-cordoba',
  worldId: 'cordoba',
  title: 'House of translation',
  steps: [
    {
      type: 'dialogue',
      speaker: 'Master translator',
      text: 'In Córdoba, Greek scrolls become Arabic — and Arabic becomes Latin for the West. Wisdom travels when scholars refuse to hoard tongues.',
    },
    {
      type: 'choose',
      text: 'What is the translator\'s first duty?',
      options: [
        { id: 'convert', label: 'To convert the reader to one faith' },
        { id: 'faithful', label: 'To render the text faithfully across tongues', correct: true },
      ],
    },
    {
      type: 'walk-to',
      text: 'Walk to the library colonnade.',
      targetX: 0,
      targetZ: -8,
      radius: 3,
    },
    {
      type: 'face-direction',
      text: 'Face the shelves where Hermetic and Platonic scrolls rest.',
      targetYaw: Math.PI,
      tolerance: 0.7,
    },
    {
      type: 'dialogue',
      speaker: 'Master translator',
      text: 'As above, so below — now in three languages. The stones may be read anew.',
    },
  ],
  completionJournal: {
    title: 'Cordoba translation',
    body: 'Initiated into the house of translation. Cross-tradition stones are unveiled.',
  },
};

export const INITIATION_SAFED: InitiationDefinition = {
  id: 'initiation-safed',
  worldId: 'safed',
  title: 'The Garden of readings',
  steps: [
    {
      type: 'dialogue',
      speaker: 'Disciple of the Ari',
      text: 'You climbed to Safed, where the exiles of Sepharad read Torah by candlelight. Every verse has four gates: Peshat, the plain; Remez, the hint; Derash, the inquiry; Sod, the secret. Their initials spell Pardes — the Garden.',
    },
    {
      type: 'choose',
      text: 'Four sages entered the Garden. At which gate does the mystery itself stand?',
      options: [
        { id: 'peshat', label: 'Peshat — the plain sense on the surface' },
        { id: 'sod', label: 'Sod — the secret that is entered, not read', correct: true },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'Disciple of the Ari',
      text: 'And only Akiva departed in peace — enter with discipline. The Ari teaches that the Infinite contracted itself to make room for a world, and the vessels shattered under the light. Stand still, and listen for what fell.',
    },
    {
      type: 'hold-still',
      text: 'Stand still. Listen for the sparks in the broken places.',
      durationSec: 7,
    },
    {
      type: 'dialogue',
      speaker: 'Disciple of the Ari',
      text: 'Every act of attention lifts a spark. The stones of this city may now be read at all four depths.',
    },
  ],
  completionJournal: {
    title: 'Entered the Garden',
    body: 'Initiated at Safed into the four levels of reading. Tzimtzum, shevirah, tikkun — contraction, shattering, repair — may now be practiced at the stones.',
  },
};

export const INITIATION_COLOGNE: InitiationDefinition = {
  id: 'initiation-cologne',
  worldId: 'cologne',
  title: 'The three worlds',
  steps: [
    {
      type: 'dialogue',
      speaker: 'The Magister\'s Scribe',
      text: 'Welcome to the magister\'s library. Agrippa tabled all magic across three worlds — natural, celestial, divine — and taught that they answer one another. Nothing here is forced; everything corresponds.',
    },
    {
      type: 'choose',
      text: 'By what art does the magus climb between the worlds?',
      options: [
        { id: 'force', label: 'By force of will, compelling the higher' },
        { id: 'correspondence', label: 'By correspondence — knowing what answers to what', correct: true },
      ],
    },
    {
      type: 'walk-to',
      text: 'Walk to the great library block.',
      targetX: 0,
      targetZ: -10,
      radius: 3.5,
    },
    {
      type: 'dialogue',
      speaker: 'The Magister\'s Scribe',
      text: 'Numbers are the joint between worlds — the squares of the planets prove it. Read the Three Books at the stone, and weigh what the Hebrews taught the magister.',
    },
  ],
  completionJournal: {
    title: 'The occult library',
    body: 'Initiated into the three worlds of Agrippa. Natural, celestial, divine — joined by correspondence, counted by number.',
  },
};

export const ALL_INITIATIONS: InitiationDefinition[] = [
  INITIATION_GROVE,
  INITIATION_ALEXANDRIA,
  INITIATION_ROME,
  INITIATION_DESERT,
  INITIATION_BYZANTIUM,
  INITIATION_CORDOBA,
  INITIATION_SAFED,
  INITIATION_COLOGNE,
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
