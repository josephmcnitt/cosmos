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
  /** Hidden until a progress node reveals this marker. */
  hiddenUntilNode?: string;
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

export type AgeBuildingPreset =
  | 'stoa'
  | 'temple-distant'
  | 'olive-tree'
  | 'column-row'
  | 'library-block'
  | 'desert-cave';

export interface AgeBuildingDef {
  id: string;
  preset: AgeBuildingPreset;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  /** Emphasize for quests / initiation (e.g. sacred olive tree). */
  highlight?: boolean;
  label?: string;
}

export interface AgeSceneryConfig {
  buildings: AgeBuildingDef[];
  skyTint?: string;
}

export interface AgeDialoguePathFlagRequirement {
  flag: string;
  value?: string | number | boolean;
}

export interface AgePostInitiationDialogueDef {
  id: string;
  speaker: string;
  text: string;
  requiresPathFlag: AgeDialoguePathFlagRequirement;
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
  scenery?: AgeSceneryConfig;
  postInitiationDialogues?: AgePostInitiationDialogueDef[];
  unlock?: { requiresAgeIds?: string[]; requiresPuzzleIds?: string[] };
  astralBuildPalette?: string[];
  /** Map navigation anchor (earth globe). */
  geoAnchor?: { lat: number; lng: number; label: string };
  /** Sim-time window when site is enterable from globe (E2). */
  playableWindow?: { start: number; end: number };
}

export interface ActorDefinition {
  id: string;
  label: string;
  displayName: string;
  tradition: SpiritualTradition;
  worldId: string;
  position: [number, number];
  yaw?: number;
  robeColor: string;
  initiationId: string;
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
