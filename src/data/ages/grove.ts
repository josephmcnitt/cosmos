import { UNIVERSE_AGE_SECONDS } from '../../core/TimeSpace';
import type { AgeDefinition } from './types';

export const GROVE_AGE: AgeDefinition = {
  id: 'grove',
  title: 'The Grove',
  eraLabel: 'Present',
  eraAnchorEventId: 'writing',
  simTimeSeconds: UNIVERSE_AGE_SECONDS,
  spawn: { position: [0, 0], yaw: 0 },
  terrain: {
    size: 40,
    segments: 48,
    color: '#2d5a3d',
    siteHalfSize: 18,
  },
  paths: [
    { width: 2.2, length: 28, position: [0, 0.03, 0] },
    { width: 2.2, length: 22, position: [0, 0.03, 0], rotationY: Math.PI / 2 },
  ],
  benches: [{ position: [-4, 0, 3] }],
  markers: [
    { id: 'grove-plato', eventId: 'platonic-academy-esoteric', position: [7, 4], label: 'Unwritten doctrines' },
    { id: 'grove-hermetic', eventId: 'hermetic-corpus', position: [5, -5], label: 'Hermetic Corpus' },
    { id: 'grove-gnostic', eventId: 'gnostic-gospels', position: [-6, -4], label: 'Gnostic texts' },
    { id: 'grove-plotinus', eventId: 'neoplatonism-plotinus', position: [-2, 7], label: 'Plotinus — The One' },
    { id: 'grove-zohar', eventId: 'zohar', position: [0, -8], label: 'The Zohar' },
  ],
  portals: [
    {
      id: 'portal-hermetic-alex',
      markerEventId: 'hermetic-corpus',
      targetAgeId: 'alexandria',
      label: 'Correspondence to Alexandria',
      puzzleId: 'puzzle-hermetic-rings',
    },
    {
      id: 'portal-plotinus-rome',
      markerEventId: 'neoplatonism-plotinus',
      targetAgeId: 'rome',
      label: 'Ascent to Rome',
      puzzleId: 'puzzle-plotinus-stance',
    },
    {
      id: 'portal-gnostic-desert',
      markerEventId: 'gnostic-gospels',
      targetAgeId: 'desert',
      label: 'Desert threshold',
      puzzleId: 'puzzle-gnostic-era',
    },
  ],
  veils: [{ id: 'veil-grove-center', position: [0, 0], label: 'Veil point' }],
  esotericLayer: { tradition: 'hermetic', geometry: 'torus-knot' },
  astralBuildPalette: ['correspondence-node', 'contemplation-ring', 'threshold-cairn', 'veil-anchor'],
};
