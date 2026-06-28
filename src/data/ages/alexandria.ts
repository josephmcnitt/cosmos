import { ceYear } from '../history/time';
import type { AgeDefinition } from './types';

export const ALEXANDRIA_AGE: AgeDefinition = {
  id: 'alexandria',
  title: 'Alexandria',
  eraLabel: '~300 BCE',
  eraAnchorEventId: 'library-alexandria',
  simTimeSeconds: ceYear(-300),
  spawn: { position: [0, 4], yaw: Math.PI },
  terrain: {
    size: 36,
    segments: 40,
    color: '#3a4a38',
    siteHalfSize: 16,
  },
  scenery: {
    buildings: [
      { id: 'alex-library-block', preset: 'library-block', position: [0, 0, -8], scale: 1 },
      { id: 'alex-columns', preset: 'column-row', position: [-14, 0, 4], rotationY: Math.PI / 4, scale: 0.85 },
    ],
  },
  paths: [
    { width: 2.5, length: 24, position: [0, 0.03, 2] },
    { width: 1.8, length: 14, position: [-5, 0.03, -3], rotationY: Math.PI / 4 },
  ],
  benches: [{ position: [3, 0, -2] }],
  markers: [
    { id: 'alex-library', eventId: 'library-alexandria', position: [0, -6], label: 'Library of Alexandria' },
    {
      id: 'alex-hermetic',
      eventId: 'hermetic-corpus',
      position: [6, 2],
      label: 'Hermetic scrolls',
      hiddenUntilNode: 'alexandria-choice-correspondence',
    },
    {
      id: 'alex-plato',
      eventId: 'platonic-academy-esoteric',
      position: [-5, 5],
      label: 'Platonic echoes',
      hiddenUntilNode: 'alexandria-choice-silence',
    },
  ],
  portals: [
    {
      id: 'portal-alex-grove',
      markerEventId: 'library-alexandria',
      targetAgeId: 'grove',
      label: 'Return to the Grove',
    },
  ],
  veils: [{ id: 'veil-alex-lighthouse', position: [0, -4], label: 'Veil of Pharos' }],
  esotericLayer: { tradition: 'hermetic', geometry: 'hermetic-spheres' },
  unlock: { requiresPuzzleIds: ['puzzle-hermetic-rings'] },
  astralBuildPalette: ['correspondence-node', 'contemplation-ring'],
};
