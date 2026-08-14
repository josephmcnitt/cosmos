import type { ProgressNodeDef } from '../types';

/**
 * Kabbalah arc — hidden meanings in text. Practice at the Zohar stone opens
 * PaRDeS; gematria opens Safed; Safed opens the Lurianic teaching; Agrippa's
 * Cologne joins the letters to the three worlds; and the shattering of the
 * vessels answers the Overflow across arcs.
 */
export const KABBALAH_PATH_NODES: ProgressNodeDef[] = [
  {
    id: 'kabbalah-pardes',
    title: 'Four levels of meaning',
    tradition: 'kabbalah',
    knowledgeMode: 'rational',
    requires: [
      { type: 'initiationCompleted', worldId: 'grove' },
      { type: 'resonanceAtLeast', tradition: 'kabbalah', amount: 0.15 },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-pardes', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'PaRDeS',
        body: 'Practice at the Zohar stone answered with a teaching: every text carries four levels — Peshat the plain, Remez the hint, Derash the inquiry, Sod the secret. The initials spell Pardes, the Garden. A hidden stone has appeared south-east of the Zohar; the four levels are the four ways the cosmos already shows you what it is.',
      },
    ],
  },
  {
    id: 'kabbalah-gematria-gate',
    title: 'The letters balance',
    tradition: 'kabbalah',
    knowledgeMode: 'rational',
    requires: [
      { type: 'nodeCompleted', nodeId: 'kabbalah-pardes' },
      { type: 'puzzleCompleted', puzzleId: 'puzzle-zohar-gematria' },
    ],
    effects: [
      { type: 'setActivePath', pathId: 'kabbalah' },
      { type: 'setPathFlag', flag: 'kabbalah-letters', value: true },
      {
        type: 'journalEntry',
        title: 'One and Love',
        body: 'Echad, one, counts thirteen. Ahavah, love, counts thirteen. Together they count twenty-six — the Name. The letters were never only letters. The portal at the Zohar stone stands open: ascend to Safed.',
      },
    ],
  },
  {
    id: 'kabbalah-tikkun',
    title: 'Shattering and repair',
    tradition: 'kabbalah',
    knowledgeMode: 'faith',
    requires: [
      { type: 'nodeCompleted', nodeId: 'kabbalah-gematria-gate' },
      { type: 'initiationCompleted', worldId: 'safed' },
      { type: 'resonanceAtLeast', tradition: 'kabbalah', amount: 0.3 },
    ],
    effects: [
      { type: 'setPathFlag', flag: 'kabbalah-tikkun', value: true },
      {
        type: 'journalEntry',
        title: 'Tzimtzum',
        body: 'The Ari teaches: the Infinite contracted to make room for a world; the vessels could not hold the light and shattered; every spark that fell waits to be lifted. Creation is not finished — it is repaired. Practice is tikkun: each session at a stone lifts a spark.',
      },
    ],
  },
  {
    id: 'agrippa-three-worlds',
    title: 'The three worlds',
    tradition: 'hermetic',
    knowledgeMode: 'rational',
    requires: [
      { type: 'nodeCompleted', nodeId: 'kabbalah-gematria-gate' },
      { type: 'puzzleCompleted', puzzleId: 'puzzle-saturn-square' },
      { type: 'ageVisited', worldId: 'cologne' },
    ],
    effects: [
      { type: 'setPathFlag', flag: 'agrippa-synthesis', value: true },
      {
        type: 'journalEntry',
        title: 'Natural, celestial, divine',
        body: 'Agrippa tables the worlds the way you already travel them: the natural world you walk, the celestial world you ride above the Earth, the divine breadth of the cosmos. Correspondence, not force, joins them — and number is the joint. The square of Saturn counts fifteen along every path; the zoom wheel is a ladder of correspondences.',
      },
    ],
  },
  {
    id: 'kabbalah-overflow-mirror',
    title: 'Two tellings, one wound',
    tradition: 'kabbalah',
    knowledgeMode: 'gnosis',
    requires: [
      { type: 'nodeCompleted', nodeId: 'kabbalah-tikkun' },
      { type: 'pathFlag', flag: 'overflow-witnessed', value: true },
    ],
    effects: [
      { type: 'setPathFlag', flag: 'kabbalah-overflow-mirror', value: true },
      {
        type: 'journalEntry',
        title: 'The vessels and the Overflow',
        body: 'You have now heard the beginning told twice. Safed says: the Infinite contracted, the vessels shattered, the sparks fell, and repair is ours. The Via says: Being united until it could not remain sealed, and the Overflow — which later tongues call the Bang — gave birth to Becoming. Two tellings, one wound, one work: gather what scattered, without forcing the Field. Sod and Gnosis stand at the same gate.',
      },
    ],
  },
];
