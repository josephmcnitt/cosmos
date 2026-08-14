import type { PuzzleTemplate } from './types';

export const PUZZLE_TEMPLATES: PuzzleTemplate[] = [
  {
    id: 'puzzle-hermetic-rings',
    type: 'ring-alignment',
    targetAgeId: 'alexandria',
    markerEventId: 'hermetic-corpus',
    // R rotates rings in fixed 0→1→2 order, so counts stay within 1 of each
    // other — only sequences of shape (a,a,a), (a+1,a,a), (a+1,a+1,a) mod 4
    // are reachable. [2,2,1] lands after exactly 5 presses.
    ringSequence: [2, 2, 1],
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
  {
    id: 'puzzle-byzantium-legacy',
    type: 'era-witness',
    targetAgeId: 'byzantium',
    markerEventId: 'neoplatonism-plotinus',
    witnessEventId: 'fall-rome',
  },
  {
    id: 'puzzle-cordoba-translation',
    type: 'era-witness',
    targetAgeId: 'cordoba',
    markerEventId: 'library-alexandria',
    witnessEventId: 'islam',
  },
  {
    id: 'puzzle-zohar-gematria',
    type: 'gematria',
    targetAgeId: 'safed',
    markerEventId: 'zohar',
    gematria: {
      prompt:
        'The Zohar reads by number as well as word. Echad — one — counts thirteen (א1 ח8 ד4). Which word counts the same, so that together they make twenty-six, the number of the Name?',
      options: [
        { id: 'ahavah', label: 'אהבה — Ahavah, love', value: 13 },
        { id: 'shalom', label: 'שלום — Shalom, peace', value: 376 },
        { id: 'emet', label: 'אמת — Emet, truth', value: 441 },
      ],
      answerId: 'ahavah',
      revelation:
        'One (13) and Love (13) together count 26 — the value of the four-letter Name. Where there is one and there is love, the Name is present. The way to Safed opens.',
    },
  },
  {
    id: 'puzzle-saturn-square',
    type: 'gematria',
    targetAgeId: 'cologne',
    markerEventId: 'sefer-yetzirah',
    gematria: {
      prompt:
        'Agrippa engraved the square of Saturn: nine chambers, three by three, every row, column, and diagonal counting fifteen. Four stands beside nine and two; eight beside one and six. Which number holds the center?',
      options: [
        { id: 'five', label: '5 — the heart of the square', value: 5 },
        { id: 'seven', label: '7 — the planetary count', value: 7 },
        { id: 'nine', label: '9 — the chambers themselves', value: 9 },
      ],
      answerId: 'five',
      revelation:
        'Five sits at the center; every path through it counts fifteen. As the numbers balance in the square, so the three worlds balance through the middle one — the way to Cologne opens.',
    },
  },
];
