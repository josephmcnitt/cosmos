import { ceYear } from '../history/time';
import type { AgeDefinition } from './types';

export const ROME_AGE: AgeDefinition = {
  id: 'rome',
  title: 'Rome — Plotinus',
  eraLabel: '~250 CE',
  eraAnchorEventId: 'neoplatonism-plotinus',
  simTimeSeconds: ceYear(250),
  spawn: { position: [0, 3], yaw: 0 },
  terrain: {
    size: 44,
    segments: 44,
    color: '#4a4038',
    siteHalfSize: 19,
  },
  scenery: {
    buildings: [
      { id: 'rome-stoa', preset: 'stoa', position: [0, 0, -10], scale: 0.85 },
      { id: 'rome-courtyard-fountain', preset: 'villa-fountain', position: [0, 0, 0], scale: 0.9 },
      { id: 'rome-villa-columns', preset: 'column-row', position: [-8, 0, -3], rotationY: Math.PI / 2, scale: 0.9 },
      { id: 'rome-temple', preset: 'temple-distant', position: [12, 0, 8], scale: 1 },
    ],
  },
  paths: [
    { width: 2, length: 24, position: [0, 0.03, 0] },
    { width: 1.5, length: 16, position: [0, 0.035, 0], rotationY: Math.PI / 2 },
  ],
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
  veils: [
    { id: 'veil-rome-villa', position: [2, -2], label: 'Veil of ascent' },
    { id: 'veil-rome-courtyard-left', position: [-4, -1], label: 'Left arc of return' },
    { id: 'veil-rome-courtyard-right', position: [4, -1], label: 'Right arc of return' },
  ],
  esotericLayer: { tradition: 'neoplatonism', geometry: 'neoplatonic-rings' },
  postInitiationDialogues: [
    {
      id: 'rome-fountain-after-ascent',
      speaker: 'Disciple of Plotinus',
      text: 'The fountain marks the quiet center: water descends, attention returns, and the three veils draw the soul inward without grasping.',
      requiresPathFlag: { flag: 'rome-villa-courtyard-dialogue', value: true },
    },
  ],
  unlock: { requiresPuzzleIds: ['puzzle-plotinus-stance'] },
  astralBuildPalette: ['contemplation-ring', 'veil-anchor'],
};
