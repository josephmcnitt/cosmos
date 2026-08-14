import { ceYear } from '../history/time';
import { EARTH_SITE_COORDS } from '../earth/siteCoordinates';
import type { AgeDefinition } from './types';

export const BYZANTIUM_AGE: AgeDefinition = {
  id: 'byzantium',
  title: 'Byzantium — Preserved light',
  eraLabel: '~500 CE',
  eraAnchorEventId: 'fall-rome',
  simTimeSeconds: ceYear(500),
  spawn: { position: [0, 4], yaw: Math.PI / 2 },
  terrain: {
    size: 40,
    segments: 44,
    color: '#4a4858',
    siteHalfSize: 18,
  },
  scenery: {
    buildings: [
      { id: 'byz-columns', preset: 'column-row', position: [0, 0, -12], scale: 1.1 },
      { id: 'byz-temple', preset: 'temple-distant', position: [10, 0, 6], scale: 0.95 },
      { id: 'byz-stoa', preset: 'stoa', position: [-8, 0, 4], rotationY: Math.PI / 3, scale: 0.9 },
    ],
  },
  paths: [
    { width: 2.2, length: 24, position: [0, 0.03, -2] },
    { width: 1.6, length: 14, position: [5, 0.03, 2], rotationY: Math.PI / 4 },
  ],
  benches: [{ position: [-4, 0, -2] }],
  markers: [
    {
      id: 'byz-plotinus',
      eventId: 'neoplatonism-plotinus',
      position: [0, -6],
      label: 'Plotinus preserved in Greek',
    },
    {
      id: 'byz-desert-fathers',
      eventId: 'desert-fathers',
      position: [-6, 3],
      label: 'Desert fathers in the East',
    },
    {
      id: 'byz-hermetic',
      eventId: 'hermetic-corpus',
      position: [5, 5],
      label: 'Hermetic scrolls copied',
    },
  ],
  portals: [
    {
      id: 'portal-byz-grove',
      markerEventId: 'neoplatonism-plotinus',
      targetAgeId: 'grove',
      label: 'Return to the Grove',
    },
  ],
  veils: [{ id: 'veil-byz-dome', position: [0, -3], label: 'Veil beneath the dome' }],
  esotericLayer: { tradition: 'neoplatonism', geometry: 'neoplatonic-rings' },
  unlock: { requiresPuzzleIds: ['puzzle-byzantium-legacy'] },
  astralBuildPalette: ['contemplation-ring', 'correspondence-node'],
  geoAnchor: EARTH_SITE_COORDS.constantinople,
  playableWindow: { start: ceYear(400), end: ceYear(700) },
};
