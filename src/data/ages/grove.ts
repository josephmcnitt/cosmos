import { UNIVERSE_AGE_SECONDS } from '../../core/TimeSpace';
import type { AgeDefinition } from './types';

export const GROVE_AGE: AgeDefinition = {
  id: 'grove',
  title: "Plato's Grove",
  eraLabel: 'Present',
  eraAnchorEventId: 'writing',
  simTimeSeconds: UNIVERSE_AGE_SECONDS,
  spawn: { position: [0, 14], yaw: Math.PI },
  terrain: {
    size: 64,
    segments: 56,
    color: '#2d5a3d',
    siteHalfSize: 28,
  },
  scenery: {
    buildings: [
      { id: 'grove-tree-1', preset: 'olive-tree', position: [-8, 0, 6], scale: 1.1 },
      { id: 'grove-tree-2', preset: 'olive-tree', position: [6, 0, 8], scale: 0.95 },
      { id: 'grove-tree-3', preset: 'olive-tree', position: [-5, 0, -7], scale: 1.05 },
      { id: 'grove-tree-4', preset: 'olive-tree', position: [9, 0, -4], scale: 1 },
      { id: 'grove-tree-init', preset: 'olive-tree', position: [-8, 0, 2], scale: 1.35, highlight: true, label: 'Sacred olive tree' },
      { id: 'grove-temple-n', preset: 'temple-distant', position: [0, 0, -24], scale: 1.4 },
      { id: 'grove-columns-e', preset: 'column-row', position: [22, 0, 0], rotationY: -Math.PI / 2, scale: 1.2 },
      { id: 'grove-stoa-w', preset: 'stoa', position: [-20, 0, -4], rotationY: Math.PI / 2, scale: 0.9 },
    ],
  },
  paths: [
    { width: 2, length: 18, position: [0, 0.03, 7], rotationY: 0 },
    { width: 2, length: 14, position: [0, 0.03, 0], rotationY: 0 },
    { width: 1.6, length: 10, position: [0, 0.03, -6], rotationY: Math.PI / 8 },
  ],
  benches: [],
  markers: [
    { id: 'grove-plato', eventId: 'platonic-academy-esoteric', position: [7, 4], label: 'Unwritten doctrines' },
    { id: 'grove-hermetic', eventId: 'hermetic-corpus', position: [5, -5], label: 'Hermetic Corpus' },
    { id: 'grove-gnostic', eventId: 'gnostic-gospels', position: [-6, -4], label: 'Gnostic texts' },
    { id: 'grove-plotinus', eventId: 'neoplatonism-plotinus', position: [-2, 7], label: 'Plotinus — The One' },
    { id: 'grove-zohar', eventId: 'zohar', position: [0, -8], label: 'The Zohar' },
    {
      id: 'grove-rosicrucian',
      eventId: 'rosicrucian',
      position: [8, 6],
      label: 'Rosicrucian manifestos',
      hiddenUntilNode: 'grove-choice-rational',
    },
    {
      id: 'grove-pythagorean',
      eventId: 'pythagorean-mysteries',
      position: [-8, 6],
      label: 'Pythagorean mysteries',
      hiddenUntilNode: 'grove-choice-experiential',
    },
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
