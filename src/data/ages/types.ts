import type { SpiritualTradition } from '../history/types';

export type WorldLayer = 'material' | 'esoteric';

export interface TerrainConfig {
  size: number;
  segments: number;
  color: string;
  siteHalfSize: number;
}

export interface AgeMarkerDef {
  id: string;
  eventId: string;
  position: [number, number];
  label: string;
}

export interface AgePathDef {
  width: number;
  length: number;
  position: [number, number, number];
  rotationY?: number;
}

export interface AgeBenchDef {
  position: [number, number, number];
}

export interface AgePortalDef {
  id: string;
  markerEventId: string;
  targetAgeId: string;
  label: string;
  puzzleId?: string;
}

export interface AgeVeilDef {
  id: string;
  position: [number, number];
  label: string;
}

export interface EsotericLayerPreset {
  tradition: SpiritualTradition;
  geometry: 'torus-knot' | 'hermetic-spheres' | 'neoplatonic-rings' | 'gnostic-dual';
}

export interface AgeDefinition {
  id: string;
  title: string;
  eraLabel: string;
  eraAnchorEventId: string;
  simTimeSeconds: number;
  spawn: { position: [number, number]; yaw: number };
  terrain: TerrainConfig;
  markers: AgeMarkerDef[];
  paths: AgePathDef[];
  benches: AgeBenchDef[];
  portals: AgePortalDef[];
  veils: AgeVeilDef[];
  esotericLayer: EsotericLayerPreset;
  unlock?: { requiresAgeIds?: string[]; requiresPuzzleIds?: string[] };
  astralBuildPalette?: string[];
}

export interface ActorDefinition {
  id: string;
  label: string;
  tradition?: SpiritualTradition;
}

export interface StructureKindDefinition {
  id: string;
  label: string;
  buildDurationSec: number;
  tradition?: SpiritualTradition;
}

export interface PuzzleTemplate {
  id: string;
  type: 'ring-alignment' | 'threshold-stance' | 'era-witness';
  targetAgeId?: string;
  markerEventId?: string;
  witnessEventId?: string;
  ringSequence?: number[];
}
