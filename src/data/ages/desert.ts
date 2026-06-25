import { ceYear } from '../history/time';
import type { AgeDefinition } from './types';

export const DESERT_AGE: AgeDefinition = {
  id: 'desert',
  title: 'Desert — Gnostic threshold',
  eraLabel: '~200 CE',
  eraAnchorEventId: 'gnostic-gospels',
  simTimeSeconds: ceYear(200),
  spawn: { position: [0, 0], yaw: 0 },
  terrain: {
    size: 38,
    segments: 42,
    color: '#5a5040',
    siteHalfSize: 17,
  },
  paths: [{ width: 1.6, length: 26, position: [0, 0.03, 0], rotationY: Math.PI / 6 }],
  benches: [{ position: [4, 0, -4] }],
  markers: [
    { id: 'desert-gnostic', eventId: 'gnostic-gospels', position: [0, -7], label: 'Gnostic texts' },
    { id: 'desert-christian', eventId: 'christianity', position: [-6, 2], label: 'Desert fathers echo' },
  ],
  portals: [
    {
      id: 'portal-desert-grove',
      markerEventId: 'gnostic-gospels',
      targetAgeId: 'grove',
      label: 'Return to the Grove',
    },
  ],
  veils: [{ id: 'veil-desert-cave', position: [-2, -3], label: 'Cave veil' }],
  esotericLayer: { tradition: 'gnosticism', geometry: 'gnostic-dual' },
  unlock: { requiresPuzzleIds: ['puzzle-gnostic-era'] },
  astralBuildPalette: ['threshold-cairn', 'veil-anchor'],
};
