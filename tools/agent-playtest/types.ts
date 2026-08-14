import type { HudState } from '../bug-catcher/extractHudState';

export interface ProbeState {
  mode: string;
  spatialExponent: number;
  avatarX: number;
  avatarZ: number;
  avatarYaw: number;
}

export interface SaveSummary {
  currentWorldId?: string;
  initiationStatus?: Record<string, string>;
  completedPuzzleIds?: string[];
  completedProgressNodeIds?: string[];
  revealedMarkerIds?: string[];
  discoveredEventIds?: string[];
  activePathId?: string;
  sessionsCompleted?: number;
  spiritualDepth?: number;
  resonance?: Record<string, number>;
  /** Ring rotations of any ring-alignment puzzle entities, keyed by defId. */
  ringRotations?: Record<string, number[]>;
}

export interface StepRecord {
  index: number;
  name: string;
  note?: string;
  at: string;
  probe: ProbeState | null;
  hud: HudState | null;
  save: SaveSummary | null;
  consoleErrors: string[];
  screenshot?: string;
  /** Free-form observations recorded by the scenario. */
  observations: string[];
  /** Set when the scenario detected something wrong at this step. */
  problems: string[];
}

export interface ScenarioResult {
  scenario: string;
  startedAt: string;
  endedAt: string;
  passed: boolean;
  steps: StepRecord[];
  error?: string;
}

export interface AgentSessionReport {
  startedAt: string;
  endedAt: string;
  url: string;
  scenarios: ScenarioResult[];
}
