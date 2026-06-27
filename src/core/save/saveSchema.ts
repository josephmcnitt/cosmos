import type { ChoiceRecord } from '../../data/progression/types';
import type { ActiveInitiation, InitiationStatus } from '../initiation/types';

export const SAVE_VERSION = 3;
export const SAVE_KEY = 'cosmos-save-v1';

export interface PersistedWorldSnapshot {
  saveVersion: number;
  savedAt: number;
  currentWorldId: string;
  unlockedWorldIds: string[];
  visitedWorldIds: string[];
  worldLayers: Record<string, 'material' | 'esoteric'>;
  discoveredEventIds: string[];
  resonance: Record<string, number>;
  sessionsCompleted: number;
  entities: import('../world/types').EntityInstance[];
  completedPuzzleIds: string[];
  puzzleState: Record<string, Record<string, unknown>>;
  simInstances: import('../world/types').SimInstance[];
  entanglements: import('../world/types').EntanglementPair[];
  journal: import('../world/types').JournalEntry[];
  eraWitnessFlags: string[];
  lastSimTickMs: number;
  initiationStatus: Record<string, InitiationStatus>;
  activeInitiation: ActiveInitiation | null;
  choiceHistory: ChoiceRecord[];
  completedProgressNodeIds: string[];
  pathFlags: Record<string, string | number | boolean>;
  activePathId?: string;
  revealedMarkerIds: string[];
}
