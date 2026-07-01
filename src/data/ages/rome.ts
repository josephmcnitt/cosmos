import { ceYear, yearsAgo } from '../history/time';
import { EARTH_SITE_COORDS } from '../earth/siteCoordinates';
import type { AgeDefinition } from './types';

export const ROME_AGE: AgeDefinition = {
  id: 'rome',
  title: 'Rome — Plotinus',
  eraLabel: '~250 CE',
  eraAnchorEventId: 'neoplatonism-plotinus',
  simTimeSeconds: ceYear(250),
  spawn: { position: [0, 3], yaw: 0 },
  terrain: {
    size: 34,
    segments: 36,
    color: '#4a4038',
    siteHalfSize: 15,
  },
  scenery: {
    buildings: [
      { id: 'rome-stoa', preset: 'stoa', position: [0, 0, -10], scale: 0.85 },
      { id: 'rome-temple', preset: 'temple-distant', position: [12, 0, 8], scale: 1 },
    ],
  },
  paths: [{ width: 2, length: 20, position: [0, 0.03, 0] }],
  benches: [{ position: [-3, 0, 2] }],
  markers: [
    { id: 'rome-plotinus', eventId: 'neoplatonism-plotinus', position: [0, -5], label: 'Plotinus — The One' },
    { id: 'rome-hermetic', eventId: 'hermetic-corpus', position: [5, 3], label: 'Hermetic echoes' },
  ],
  portals: [
    {
      id: 'portal-rome-grove',
      markerEventId: 'neoplatonism-plotinus',
      targetAgeId: 'grove',
      label: 'Return to the Grove',
    },
  ],
  veils: [{ id: 'veil-rome-villa', position: [2, -2], label: 'Veil of ascent' }],
  esotericLayer: { tradition: 'neoplatonism', geometry: 'neoplatonic-rings' },
  unlock: { requiresPuzzleIds: ['puzzle-plotinus-stance'] },
  astralBuildPalette: ['contemplation-ring', 'veil-anchor'],
  geoAnchor: EARTH_SITE_COORDS.rome,
  playableWindow: { start: ceYear(-500), end: yearsAgo(0) },
};
