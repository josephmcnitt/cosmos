import { ceYear } from '../history/time';
import { EARTH_SITE_COORDS } from '../earth/siteCoordinates';
import type { AgeDefinition } from './types';

/** 16th-century Galilee hilltop — the city of the Kabbalists. */
export const SAFED_AGE: AgeDefinition = {
  id: 'safed',
  title: 'Safed — City of Kabbalists',
  eraLabel: '~1570 CE',
  eraAnchorEventId: 'kabbalah-luria',
  simTimeSeconds: ceYear(1570),
  spawn: { position: [0, 10], yaw: Math.PI },
  terrain: {
    size: 44,
    segments: 48,
    color: '#57608c',
    siteHalfSize: 20,
  },
  scenery: {
    buildings: [
      { id: 'safed-house-1', preset: 'library-block', position: [-9, 0, -4], scale: 0.8 },
      { id: 'safed-house-2', preset: 'library-block', position: [9, 0, -7], scale: 0.7 },
      { id: 'safed-house-3', preset: 'library-block', position: [-6, 0, 7], rotationY: Math.PI / 5, scale: 0.65 },
      { id: 'safed-synagogue', preset: 'temple-distant', position: [0, 0, -16], scale: 1.05, highlight: true, label: 'House of study' },
      { id: 'safed-stair', preset: 'column-row', position: [12, 0, 3], rotationY: Math.PI / 2, scale: 0.8 },
    ],
    skyTint: '#2a2a4a',
  },
  paths: [
    { width: 1.8, length: 20, position: [0, 0.03, 2] },
    { width: 1.4, length: 12, position: [-5, 0.03, -4], rotationY: Math.PI / 3 },
  ],
  benches: [{ position: [3, 0, -1] }],
  markers: [
    {
      id: 'safed-luria',
      eventId: 'kabbalah-luria',
      position: [0, -7],
      label: 'Tzimtzum — the contraction',
    },
    {
      id: 'safed-zohar',
      eventId: 'zohar',
      position: [-7, 0],
      label: 'Zohar recitation',
    },
    {
      id: 'safed-yetzirah',
      eventId: 'sefer-yetzirah',
      position: [7, -2],
      label: 'Letters of Formation',
    },
    {
      id: 'safed-pardes',
      eventId: 'pardes-four-levels',
      position: [4, 5],
      label: 'The Garden of readings',
    },
  ],
  portals: [
    {
      id: 'portal-safed-grove',
      markerEventId: 'zohar',
      targetAgeId: 'grove',
      label: 'Return to the Grove',
    },
    {
      id: 'portal-safed-cologne',
      markerEventId: 'sefer-yetzirah',
      targetAgeId: 'cologne',
      label: 'Transmission to Cologne',
      puzzleId: 'puzzle-saturn-square',
    },
  ],
  veils: [{ id: 'veil-safed-stair', position: [0, 0], label: 'Veil on the stair' }],
  esotericLayer: { tradition: 'kabbalah', geometry: 'torus-knot' },
  unlock: { requiresPuzzleIds: ['puzzle-zohar-gematria'] },
  astralBuildPalette: ['contemplation-ring', 'correspondence-node'],
  geoAnchor: EARTH_SITE_COORDS.safed,
  playableWindow: { start: ceYear(1500), end: ceYear(1750) },
};
