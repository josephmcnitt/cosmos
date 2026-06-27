import { computeSpiritualDepth } from '../practice';
import type { ProgressEvaluationInput } from './types';

export function buildProgressInputFromWorld(state: {
  completedProgressNodeIds: string[];
  choiceHistory: ProgressEvaluationInput['choiceHistory'];
  pathFlags: ProgressEvaluationInput['pathFlags'];
  initiationStatus: ProgressEvaluationInput['initiationStatus'];
  completedPuzzleIds: string[];
  visitedWorldIds: string[];
  resonance: ProgressEvaluationInput['resonance'];
  sessionsCompleted: number;
}): ProgressEvaluationInput {
  return {
    completedProgressNodeIds: state.completedProgressNodeIds,
    choiceHistory: state.choiceHistory,
    pathFlags: state.pathFlags,
    initiationStatus: state.initiationStatus,
    completedPuzzleIds: state.completedPuzzleIds,
    visitedWorldIds: state.visitedWorldIds,
    resonance: state.resonance,
    sessionsCompleted: state.sessionsCompleted,
    spiritualDepth: computeSpiritualDepth(state.resonance),
  };
}
