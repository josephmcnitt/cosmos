import type { ChoiceRecord } from '../../data/progression/types';
import type { SpiritualTradition } from '../../data/history/types';
import type { InitiationStatus } from '../initiation/types';

/** Snapshot fields used by the progression evaluator. */
export interface ProgressEvaluationInput {
  completedProgressNodeIds: string[];
  choiceHistory: ChoiceRecord[];
  pathFlags: Record<string, string | number | boolean>;
  initiationStatus: Record<string, InitiationStatus>;
  completedPuzzleIds: string[];
  visitedWorldIds: string[];
  resonance: Partial<Record<SpiritualTradition, number>>;
  sessionsCompleted: number;
  spiritualDepth: number;
}

export interface ProgressEvaluationResult {
  newlyCompletedNodeIds: string[];
  allCompletedNodeIds: string[];
  availableNodeIds: string[];
}
