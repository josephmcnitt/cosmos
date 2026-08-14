import { ceYear } from '../history/time';
import { EARTH_SITE_COORDS } from '../earth/siteCoordinates';
import type { AgeDefinition } from './types';

/** Agrippa's study — the occult library where three worlds are tabled. */
export const COLOGNE_AGE: AgeDefinition = {
  id: 'cologne',
  title: 'Cologne — The Occult Library',
  eraLabel: '~1533 CE',
  eraAnchorEventId: 'agrippa-occult-philosophy',
  simTimeSeconds: ceYear(1533),
  spawn: { position: [0, 8], yaw: Math.PI },
  terrain: {
    size: 38,
    segments: 40,
    color: '#4c4452',
    siteHalfSize: 17,
  },
  scenery: {
    buildings: [
      { id: 'col-library', preset: 'library-block', position: [0, 0, -12], scale: 1.2, highlight: true, label: 'The occult library' },
      { id: 'col-shelf-e', preset: 'stoa', position: [10, 0, -2], rotationY: -Math.PI / 2, scale: 0.75 },
      { id: 'col-shelf-w', preset: 'stoa', position: [-10, 0, -2], rotationY: Math.PI / 2, scale: 0.75 },
      { id: 'col-press', preset: 'column-row', position: [6, 0, 6], rotationY: Math.PI / 6, scale: 0.6 },
    ],
    skyTint: '#241f2e',
  },
  paths: [
    { width: 1.8, length: 18, position: [0, 0.03, 0] },
  ],
  benches: [{ position: [-4, 0, 3] }],
  markers: [
    {
      id: 'col-agrippa',
      eventId: 'agrippa-occult-philosophy',
      position: [0, -6],
      label: 'Three Books of Occult Philosophy',
    },
    {
      id: 'col-hermetic',
      eventId: 'hermetic-corpus',
      position: [-6, 2],
      label: 'Hermetica in Latin print',
    },
    {
      id: 'col-rosicrucian',
      eventId: 'rosicrucian',
      position: [6, 1],
      label: 'Seeds of the manifestos',
    },
  ],
  portals: [
    {
      id: 'portal-cologne-safed',
      markerEventId: 'agrippa-occult-philosophy',
      targetAgeId: 'safed',
      label: 'Return to Safed',
    },
  ],
  veils: [{ id: 'veil-cologne-desk', position: [0, -2], label: 'Veil at the writing desk' }],
  esotericLayer: { tradition: 'hermetic', geometry: 'hermetic-spheres' },
  unlock: { requiresPuzzleIds: ['puzzle-saturn-square'] },
  astralBuildPalette: ['contemplation-ring', 'correspondence-node'],
  geoAnchor: EARTH_SITE_COORDS.cologne,
  playableWindow: { start: ceYear(1480), end: ceYear(1650) },
};
