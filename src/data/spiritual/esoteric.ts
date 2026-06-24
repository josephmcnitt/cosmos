import type { SpiritualEvent } from '../history/types';
import { ceYear, yearsAgo } from '../history/time';

const HUMAN = { spatialBand: 'human' as const, spatialExponent: 2 };

export const ESOTERIC_EVENTS: SpiritualEvent[] = [
  {
    id: 'platonic-academy-esoteric',
    simTimeSeconds: ceYear(-400),
    track: 'spiritual',
    tradition: 'platonism',
    visibility: 'esoteric',
    title: 'Unwritten doctrines',
    summary:
      'Beyond his published dialogues, Plato is said to have taught oral doctrines on the One and the Indefinite Dyad — seeds of later Neoplatonism.',
    body:
      'Ancient reports (especially from Aristotle and later Neoplatonists) suggest Plato reserved his deepest metaphysical teaching for inner-circle students. Whether these "unwritten doctrines" existed as a systematic esoteric curriculum or as speculative reconstruction remains debated — but they became a foundation for Western esoteric Platonism for two millennia.',
    relatedMaterialIds: ['plato'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Unwritten_doctrine',
  },
  {
    id: 'neoplatonism-plotinus',
    simTimeSeconds: ceYear(250),
    track: 'spiritual',
    tradition: 'neoplatonism',
    visibility: 'esoteric',
    title: 'Plotinus — The One',
    summary:
      'Plotinus teaches emanation from the ineffable One through Nous and Soul — a ladder of ascent from matter back to unity.',
    body:
      'In the Enneads, Plotinus maps reality as concentric rings of being emanating from a source beyond being itself. The philosopher\'s task is contemplative ascent — purifying the soul until it mirrors the One. Neoplatonism will influence Christian mystics, Islamic philosophers, Kabbalists, and Renaissance Hermeticists.',
    relatedMaterialIds: ['library-alexandria'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Plotinus',
  },
  {
    id: 'hermetic-corpus',
    simTimeSeconds: ceYear(200),
    track: 'spiritual',
    tradition: 'hermetic',
    visibility: 'esoteric',
    title: 'Hermetic Corpus',
    summary:
      'Texts attributed to Hermes Trismegistus teach "As above, so below" — the microcosm mirrors the macrocosm in a living, ensouled universe.',
    body:
      'The Hermetica blend Greek philosophy, Egyptian religion, and alchemical symbolism. They propose that human beings can know the divine by understanding correspondences between celestial and terrestrial realms — a template for Western esotericism from late antiquity through the Renaissance.',
    relatedMaterialIds: ['heavy-elements', 'library-alexandria'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Hermetica',
  },
  {
    id: 'gnostic-gospels',
    simTimeSeconds: ceYear(200),
    track: 'spiritual',
    tradition: 'gnosticism',
    visibility: 'esoteric',
    title: 'Gnostic texts',
    summary:
      'Hidden gospels teach that the material world is a prison — gnosis, secret knowledge, frees the divine spark within.',
    body:
      'Gnostic communities produced texts like the Gospel of Thomas and Apocryphon of John, often suppressed by orthodox Christianity. They share a myth of a fallen creator god and a transcendent true God — the soul awakens through inner revelation, not institutional authority alone.',
    relatedMaterialIds: ['christianity'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Gnosticism',
  },
  {
    id: 'alchemy-golden',
    simTimeSeconds: ceYear(300),
    track: 'spiritual',
    tradition: 'alchemy',
    visibility: 'esoteric',
    title: 'Alchemical tradition',
    summary:
      'Alchemists pursue transmutation of metals — and of the soul — through sealed vessels, symbols, and stages of purification.',
    relatedMaterialIds: ['library-alexandria'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Alchemy',
  },
  {
    id: 'sefer-yetzirah',
    simTimeSeconds: ceYear(600),
    track: 'spiritual',
    tradition: 'kabbalah',
    visibility: 'esoteric',
    title: 'Sefer Yetzirah',
    summary:
      'The "Book of Formation" describes creation through Hebrew letters and the Sefirot — early Kabbalistic cosmology.',
    body:
      'This short mystical text presents the universe as structured by divine speech — ten sefirot and twenty-two letters combine to form all reality. It becomes a cornerstone of Jewish esoteric tradition, later expanded dramatically in the Zohar.',
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Sefer_Yetzirah',
  },
  {
    id: 'sufism-origin',
    simTimeSeconds: ceYear(800),
    track: 'spiritual',
    tradition: 'sufism',
    visibility: 'esoteric',
    title: 'Sufi mysticism emerges',
    summary:
      'Islamic mystics pursue direct experience of God through dhikr (remembrance), poetry, and ascetic discipline.',
    relatedMaterialIds: ['islam'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Sufism',
  },
  {
    id: 'zohar',
    simTimeSeconds: ceYear(1300),
    track: 'spiritual',
    tradition: 'kabbalah',
    visibility: 'esoteric',
    title: 'The Zohar',
    summary:
      'The Zohar unveils Kabbalah\'s symbolic Torah — divine emanations, soul-sparks, and the drama of cosmic repair (tikkun).',
    body:
      'Attributed to Moses de León in medieval Spain, the Zohar is a vast mystical commentary on Torah cast as wanderings of Rabbi Shimon bar Yochai. Its mythopoetic language of sefirot, shekhinah, and exile will define Kabbalah for centuries and influence Christian Kabbalists and Hermetic orders.',
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Zohar',
  },
  {
    id: 'kabbalah-luria',
    simTimeSeconds: ceYear(1570),
    track: 'spiritual',
    tradition: 'kabbalah',
    visibility: 'esoteric',
    title: 'Lurianic Kabbalah',
    summary:
      'Isaac Luria teaches tzimtzum — divine contraction — and the shattering of vessels, giving cosmic meaning to exile and repair.',
    body:
      'In Safed, Luria reframes creation as a traumatic rupture requiring human action to restore divine unity. Every mitzvah and every act of consciousness participates in tikkun olam — repairing the world. This theology deeply shapes Hasidism and modern Jewish mysticism.',
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Isaac_Luria',
  },
  {
    id: 'rosicrucian',
    simTimeSeconds: ceYear(1614),
    track: 'spiritual',
    tradition: 'hermetic',
    visibility: 'esoteric',
    title: 'Rosicrucian manifestos',
    summary:
      'Anonymous pamphlets announce a hidden brotherhood of adepts — alchemy, healing, and esoteric Christianity in one myth.',
    relatedMaterialIds: ['printing-press'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Rosicrucianism',
  },
  {
    id: 'christian-kabbalah',
    simTimeSeconds: ceYear(1480),
    track: 'spiritual',
    tradition: 'kabbalah',
    visibility: 'esoteric',
    title: 'Christian Kabbalah',
    summary:
      'Renaissance scholars like Pico della Mirandola weave Kabbalah into Christian theology — Hebrew letters as keys to divine names.',
    relatedMaterialIds: ['printing-press'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Christian_Kabbalah',
  },
  {
    id: 'paracelsus',
    simTimeSeconds: ceYear(1530),
    track: 'spiritual',
    tradition: 'alchemy',
    visibility: 'esoteric',
    title: 'Paracelsian medicine',
    summary:
      'Paracelsus merges alchemy with healing — each disease has a spiritual signature; the physician is also a philosopher of nature.',
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Paracelsus',
  },
  {
    id: 'theosophy',
    simTimeSeconds: ceYear(1875),
    track: 'spiritual',
    tradition: 'theosophy',
    visibility: 'esoteric',
    title: 'Theosophical Society',
    summary:
      'Blavatsky and Olcott launch a modern synthesis of Eastern and Western esoteric traditions — hidden masters and ancient wisdom.',
    relatedMaterialIds: ['darwin'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Theosophical_Society',
  },
  {
    id: 'golden-dawn',
    simTimeSeconds: ceYear(1888),
    track: 'spiritual',
    tradition: 'hermetic',
    visibility: 'esoteric',
    title: 'Hermetic Order of the Golden Dawn',
    summary:
      'A secret society systematizes Western magic — tarot, Kabbalah, Enochian calls, and graded initiation into Hermetic knowledge.',
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Hermetic_Order_of_the_Golden_Dawn',
  },
  {
    id: 'dion-fortune',
    simTimeSeconds: ceYear(1924),
    track: 'spiritual',
    tradition: 'hermetic',
    visibility: 'esoteric',
    title: 'Dion Fortune\'s occult school',
    summary:
      'Fortune teaches practical Western esotericism — psychology, Kabbalah, and ritual as tools for spiritual development.',
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Dion_Fortune',
  },
  {
    id: 'jung-archetypes',
    simTimeSeconds: ceYear(1912),
    track: 'spiritual',
    tradition: 'general',
    visibility: 'esoteric',
    title: 'Jung and the collective unconscious',
    summary:
      'Carl Jung maps archetypes and the individuation process — depth psychology re-enters esoteric territory through alchemy and Gnosis.',
    relatedMaterialIds: ['world-war-one'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Carl_Jung',
  },
  {
    id: 'upanishads-esoteric',
    simTimeSeconds: yearsAgo(2.8e3),
    track: 'spiritual',
    tradition: 'hindu_mysticism',
    visibility: 'esoteric',
    title: 'Upanishadic mysticism',
    summary:
      'The Upanishads teach tat tvam asi — "Thou art That" — the Atman and Brahman are one beneath the veil of illusion.',
    relatedMaterialIds: ['writing'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Upanishads',
  },
  {
    id: 'pythagorean-mysteries',
    simTimeSeconds: ceYear(-530),
    track: 'spiritual',
    tradition: 'general',
    visibility: 'esoteric',
    title: 'Pythagorean mysteries',
    summary:
      'Pythagoras founds a mystical brotherhood — number, music, and purification of the soul as keys to cosmic harmony.',
    relatedMaterialIds: ['plato'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Pythagoreanism',
  },
  {
    id: 'desert-fathers',
    simTimeSeconds: ceYear(300),
    track: 'spiritual',
    tradition: 'christian_mysticism',
    visibility: 'esoteric',
    title: 'Desert Fathers',
    summary:
      'Christian hermits withdraw to the Egyptian desert — radical asceticism, ceaseless prayer, and combat with inner demons.',
    relatedMaterialIds: ['christianity'],
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Desert_Fathers',
  },
  {
    id: 'tantra-emergence',
    simTimeSeconds: ceYear(600),
    track: 'spiritual',
    tradition: 'hindu_mysticism',
    visibility: 'esoteric',
    title: 'Tantric traditions',
    summary:
      'Tantra develops ritual and yogic technologies for awakening — transforming desire and body into vehicles of liberation.',
    ...HUMAN,
    sourceUrl: 'https://en.wikipedia.org/wiki/Tantra',
  },
];
