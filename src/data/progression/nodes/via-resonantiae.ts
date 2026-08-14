import type { ProgressNodeDef } from '../types';

/** Ultimate arc — Via Resonantiae emerges after cross-age practice in the Grove. */
export const VIA_RESONANTIAE_NODES: ProgressNodeDef[] = [
  {
    id: 'via-resonantiae-threshold',
    title: 'Resonant threshold',
    tradition: 'via_resonantiae',
    requires: [
      { type: 'initiationCompleted', worldId: 'grove' },
      { type: 'spiritualDepthAtLeast', amount: 0.3 },
      { type: 'ageVisited', worldId: 'alexandria' },
      { type: 'ageVisited', worldId: 'rome' },
    ],
    effects: [
      { type: 'setPathFlag', flag: 'via-resonantiae-discovered', value: true },
      { type: 'setActivePath', pathId: 'via-resonantiae' },
      { type: 'revealMarker', markerId: 'grove-via-charter', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'The Resonant Path',
        body: 'After walking Hermetic, Platonic, and Neoplatonic stones across Ages, something else stirs near the Veil point — a tradition that maps are not territory, and resonance is practiced.',
      },
    ],
  },
  {
    id: 'via-resonantiae-myth',
    title: 'Before the Veils',
    tradition: 'via_resonantiae',
    knowledgeMode: 'faith',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-threshold' },
      { type: 'spiritualDepthAtLeast', amount: 0.35 },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-myth', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'Spark and Field',
        body: 'Discover the Myth stone north of the Veil point. In the beginning was Resonance — and you are its local song.',
      },
    ],
  },
  {
    id: 'via-resonantiae-maps',
    title: 'Maps not territory',
    tradition: 'via_resonantiae',
    knowledgeMode: 'rational',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-myth' },
      { type: 'spiritualDepthAtLeast', amount: 0.4 },
      { type: 'resonanceAtLeast', tradition: 'via_resonantiae', amount: 0.1 },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-maps', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'Research and practice',
        body: 'The Maps stone translates myth into honest vocabulary. Science maps structure; practice explores territory — neither replaces the other.',
      },
    ],
  },
  {
    id: 'via-resonantiae-liber-i',
    title: 'Book of Resonance',
    tradition: 'via_resonantiae',
    knowledgeMode: 'faith',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-maps' },
      { type: 'spiritualDepthAtLeast', amount: 0.45 },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-liber-i', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'Four ways',
        body: 'Liber I teaches Logos, Pistis, Pathos, and Gnosis — no way replaces another. Practice at the stone; hold still (Q) until resonance answers.',
      },
    ],
  },
  {
    id: 'via-resonantiae-liber-ii',
    title: 'Book of Veils',
    tradition: 'via_resonantiae',
    knowledgeMode: 'experience',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-liber-i' },
      { type: 'spiritualDepthAtLeast', amount: 0.48 },
      { type: 'ageVisited', worldId: 'desert' },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-liber-ii', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'Seven Veils',
        body: 'Liber II maps filter-depths as modes — waking, focus, daystream, imaginal, hypnagogic, bleed, flood. Pass with skill; seal what you open.',
      },
    ],
  },
  {
    id: 'via-resonantiae-liber-iii',
    title: 'Book of Star Fire',
    tradition: 'via_resonantiae',
    knowledgeMode: 'experience',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-liber-ii' },
      { type: 'spiritualDepthAtLeast', amount: 0.5 },
      { type: 'resonanceAtLeast', tradition: 'via_resonantiae', amount: 0.2 },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-liber-iii', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'Core Frequency',
        body: 'You are Spark — honorable locality in the Field. Liber III teaches discovery of your Core Frequency without forcing the mode landscape.',
      },
    ],
  },
  {
    id: 'via-resonantiae-liber-iv',
    title: 'Book of Union',
    tradition: 'via_resonantiae',
    knowledgeMode: 'faith',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-liber-iii' },
      { type: 'spiritualDepthAtLeast', amount: 0.52 },
      { type: 'ageVisited', worldId: 'byzantium' },
      { type: 'ageVisited', worldId: 'cordoba' },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-liber-iv', worldId: 'grove' },
      {
        type: 'journalEntry',
        title: 'The Covenant',
        body: 'Liber IV — coupling without consumption, stop sovereign, no guru demands. Union is practiced across Byzantium and Córdoba; sealed here at the Grove.',
      },
    ],
  },
  {
    id: 'via-resonantiae-silent-gate',
    title: 'Silent Gate',
    tradition: 'via_resonantiae',
    knowledgeMode: 'gnosis',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-liber-iv' },
      { type: 'spiritualDepthAtLeast', amount: 0.55 },
      { type: 'resonanceAtLeast', tradition: 'via_resonantiae', amount: 0.35 },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-silent-gate', worldId: 'grove' },
      { type: 'setPathFlag', flag: 'via-resonantiae-silent-gate', value: true },
      {
        type: 'journalEntry',
        title: 'Liber V — Silence',
        body: 'The ultimate teaching cannot be carried back as proof. At the Veil point, discover Liber V. Tab to the esoteric layer, hold Q to the spiritual realm, then hold J — the astral split mirrors what the Path names Gnosis.',
      },
    ],
  },
  {
    id: 'via-resonantiae-liber-vi',
    title: 'Book of Dimensions',
    tradition: 'via_resonantiae',
    knowledgeMode: 'faith',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-silent-gate' },
      { type: 'spiritualDepthAtLeast', amount: 0.6 },
      { type: 'resonanceAtLeast', tradition: 'via_resonantiae', amount: 0.4 },
    ],
    effects: [
      { type: 'revealMarker', markerId: 'grove-via-liber-vi', worldId: 'grove' },
      { type: 'setPathFlag', flag: 'via-resonantiae-ladder', value: true },
      {
        type: 'journalEntry',
        title: 'Liber VI — The Overflow',
        body: 'Beyond Silence, one last book: the Ladder — Point, Line, Plane, Being, Becoming. In the beginning there was only Being; then came the Overflow, which later tongues call the Bang. Leave the walk, scrub the timeline back to the first light, and witness the Overflow the myth remembers.',
      },
    ],
  },
  {
    id: 'via-resonantiae-overflow',
    title: 'The Overflow witnessed',
    tradition: 'via_resonantiae',
    knowledgeMode: 'experience',
    requires: [
      { type: 'nodeCompleted', nodeId: 'via-resonantiae-liber-vi' },
      { type: 'pathFlag', flag: 'overflow-witnessed', value: true },
    ],
    effects: [
      { type: 'setPathFlag', flag: 'via-resonantiae-complete', value: true },
      {
        type: 'journalEntry',
        title: 'Amen Resonantiae',
        body: 'You stood at the present and walked the years back to the first light — and saw the Overflow the parable remembers, the moment Being could not remain sealed and Becoming was born. The Path is walked. Go forth as Point. Feed what is human. Extend Lines. Honor the Plane. Meet diverse Wells and create. Amen Resonantiae — so resonates the Path, without proof.',
      },
    ],
  },
];
