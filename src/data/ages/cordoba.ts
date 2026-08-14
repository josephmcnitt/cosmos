import { ceYear } from '../history/time';
import { EARTH_SITE_COORDS } from '../earth/siteCoordinates';
import type { AgeDefinition } from './types';

export const CORDOBA_AGE: AgeDefinition = {
  id: 'cordoba',
  title: 'Córdoba — House of translation',
  eraLabel: '~900 CE',
  eraAnchorEventId: 'islam',
  simTimeSeconds: ceYear(900),
  spawn: { position: [0, 3], yaw: 0 },
  terrain: {
    size: 44,
    segments: 48,
    color: '#5a5040',
    siteHalfSize: 20,
  },
  scenery: {
    buildings: [
      { id: 'cordoba-library', preset: 'library-block', position: [0, 0, -10], scale: 1 },
      { id: 'cordoba-columns', preset: 'column-row', position: [-12, 0, 2], rotationY: Math.PI / 6, scale: 0.85 },
      { id: 'cordoba-stoa', preset: 'stoa', position: [10, 0, 6], scale: 0.8 },
    ],
  },
  paths: [
    { width: 2.4, length: 28, position: [0, 0.03, -4] },
    { width: 1.8, length: 12, position: [-4, 0.03, 0], rotationY: Math.PI / 2 },
  ],
  benches: [{ position: [3, 0, -2] }],
  markers: [
    {
      id: 'cordoba-library-stone',
      eventId: 'library-alexandria',
      position: [0, -5],
      label: 'Alexandria texts translated',
    },
    {
      id: 'cordoba-hermetic',
      eventId: 'hermetic-corpus',
      position: [6, 2],
      label: 'Hermetica in Arabic',
    },
    {
      id: 'cordoba-sufi',
      eventId: 'sufism-origin',
      position: [-5, 4],
      label: 'Sufi devotion',
    },
  ],
  portals: [
    {
      id: 'portal-cordoba-grove',
      markerEventId: 'library-alexandria',
      targetAgeId: 'grove',
      label: 'Return to the Grove',
    },
  ],
  veils: [{ id: 'veil-cordoba-arch', position: [2, -2], label: 'Veil of the arch' }],
  esotericLayer: { tradition: 'hermetic', geometry: 'hermetic-spheres' },
  unlock: { requiresPuzzleIds: ['puzzle-cordoba-translation'] },
  astralBuildPalette: ['correspondence-node', 'contemplation-ring'],
  geoAnchor: EARTH_SITE_COORDS.cordoba,
  playableWindow: { start: ceYear(750), end: ceYear(1100) },
};
