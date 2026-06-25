import type { StructureKindDefinition } from '../ages/types';

export const STRUCTURE_KINDS: StructureKindDefinition[] = [
  { id: 'correspondence-node', label: 'Correspondence Node', buildDurationSec: 120, tradition: 'hermetic' },
  { id: 'contemplation-ring', label: 'Contemplation Ring', buildDurationSec: 90, tradition: 'neoplatonism' },
  { id: 'threshold-cairn', label: 'Threshold Cairn', buildDurationSec: 60, tradition: 'gnosticism' },
  { id: 'veil-anchor', label: 'Veil Anchor', buildDurationSec: 150, tradition: 'kabbalah' },
];
