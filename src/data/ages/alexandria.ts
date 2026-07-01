import { ceYear } from '../history/time';
import { EARTH_SITE_COORDS } from '../earth/siteCoordinates';
import type { AgeDefinition } from './types';

export const ALEXANDRIA_AGE: AgeDefinition = {
  id: 'alexandria',
  title: 'Alexandria',
  eraLabel: '~300 BCE',
  eraAnchorEventId: 'library-alexandria',
  simTimeSeconds: ceYear(-300),
  spawn: { position: [0, 4], yaw: Math.PI },
  terrain: {
    size: 72,
    segments: 64,
    color: '#3a4a38',
    siteHalfSize: 32,
  },
  scenery: {
    buildings: [
      { id: 'alex-library-block', preset: 'library-block', position: [0, 0, -8], scale: 1 },
      { id: 'alex-library-east-stack', preset: 'library-block', position: [14, 0, -14], rotationY: -Math.PI / 8, scale: 0.85 },
      { id: 'alex-library-west-stack', preset: 'library-block', position: [-16, 0, -18], rotationY: Math.PI / 6, scale: 0.75 },
      { id: 'alex-columns', preset: 'column-row', position: [-14, 0, 4], rotationY: Math.PI / 4, scale: 0.85 },
    ],
  },
  paths: [
    { width: 2.5, length: 34, position: [0, 0.03, -3] },
    { width: 1.8, length: 14, position: [-5, 0.03, -3], rotationY: Math.PI / 4 },
    { width: 1.8, length: 22, position: [7, 0.03, -12], rotationY: Math.PI / 2.7 },
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
  postInitiationDialogues: [
    {
      id: 'alexandria-library-colonnade-after-purification',
      speaker: 'Keeper of the Serapeum',
      text: 'When purification is complete, the colonnade becomes a second index: seek the dim stacks where correspondence hides in architecture as much as scroll.',
      requiresPathFlag: { flag: 'alexandria-purified-library-dialogue', value: true },
    },
  ],
  unlock: { requiresPuzzleIds: ['puzzle-hermetic-rings'] },
  astralBuildPalette: ['correspondence-node', 'contemplation-ring'],
  geoAnchor: EARTH_SITE_COORDS.alexandria,
  playableWindow: { start: ceYear(-330), end: ceYear(640) },
};
