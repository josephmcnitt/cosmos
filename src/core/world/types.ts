export type EntityKind = 'marker' | 'portal' | 'actor' | 'structure' | 'puzzle-mechanism' | 'veil';
export type WorldId = string;
export type EntityId = string;
export type SimInstanceId = string;

export type WorldLayer = 'material' | 'esoteric';

export interface EntityTransform {
  x: number;
  z: number;
  yaw?: number;
}

export interface EntityInstance {
  id: EntityId;
  kind: EntityKind;
  defId: string;
  worldId: WorldId;
  layer: WorldLayer;
  transform: EntityTransform;
  state: Record<string, unknown>;
}

export type SimInstanceKind = 'player-material' | 'player-astral' | 'npc' | 'ambient';

export interface SimInstance {
  id: SimInstanceId;
  kind: SimInstanceKind;
  worldId: WorldId;
  layer: WorldLayer;
  controller: 'human' | 'autonomous';
  entityId?: EntityId;
  entangledWith?: SimInstanceId[];
  /** Autonomous agent state */
  agentState?: AstralAgentState;
}

export interface AstralAgentState {
  phase: 'idle' | 'walking' | 'building' | 'practicing' | 'resting';
  targetX?: number;
  targetZ?: number;
  buildEntityId?: EntityId;
  buildProgress?: number;
}

export interface PlacedStructureBlueprint {
  kindId: string;
  x: number;
  z: number;
}

export interface PuzzleProgress {
  puzzleId: string;
  completed: boolean;
  state: Record<string, unknown>;
}

export interface SensePayload {
  message: string;
  tradition?: string;
}

export interface EntanglementPair {
  id: string;
  materialInstanceId: SimInstanceId;
  astralInstanceId: SimInstanceId;
  sharedResonance: Record<string, number>;
  strength: number;
  lastSenseAt: number;
  pendingBlueprints: PlacedStructureBlueprint[];
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  at: number;
}
