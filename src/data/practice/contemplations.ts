import type { SpiritualTradition } from '../history/types';

export const CONTEMPLATION_LINES: Partial<Record<SpiritualTradition, string[]>> = {
  platonism: [
    'Beyond the visible forms, what is the One?',
    'The soul turns toward the intelligible light.',
    'What is always, but never becomes?',
    'In silence, the unwritten doctrines stir.',
    'The academy is written; the teaching is whispered.',
  ],
  hermetic: [
    'As above, so below — as within, so without.',
    'The microcosm mirrors the living macrocosm.',
    'Correspondence opens the sealed vessel.',
    'Know yourself, and you know the All.',
    'Three worlds breathe through one breath.',
  ],
  gnosticism: [
    'The divine spark sleeps in matter.',
    'Gnosis is remembrance, not instruction.',
    'What prison is this world, and who holds the key?',
    'Awaken — the true God is beyond the demiurge.',
    'The hidden gospel is the one you already carry.',
  ],
  neoplatonism: [
    'From the One, all emanation flows.',
    'Ascend the ladder: Soul, Nous, the ineffable One.',
    'Purify the mirror until it reflects unity.',
    'Plotinus walks inward — follow without looking back.',
    'Return is not departure; it is recognition.',
  ],
  kabbalah: [
    'Ten sefirot — ten emanations of divine speech.',
    'Letters form worlds; worlds form letters.',
    'Exile and return — the soul seeks its root.',
    'The Zohar speaks in symbols; listen beneath the words.',
    'Every spark lost in exile waits for tikkun.',
  ],
  via_resonantiae: [
    'Maps are not territory; resonance is practiced.',
    'You are Spark — tend the Well.',
    'Pass the Veils you are ready for; seal what you open.',
    'Integrate or stop — the First Dissonance teaches both.',
    'Silence. What you cannot say, do not fake.',
    'Without a Well, there is no Point.',
    'Climb without flood — Point, Line, Plane, Being, Becoming.',
    'The Overflow, which later tongues call the Bang.',
    'Keep your Well. Seek the other. Co-create.',
  ],
};

export function getContemplationLine(
  tradition: SpiritualTradition,
  index: number,
): string {
  const lines = CONTEMPLATION_LINES[tradition];
  if (!lines || lines.length === 0) {
    return 'Be still. Something watches from the other side.';
  }
  return lines[index % lines.length];
}
