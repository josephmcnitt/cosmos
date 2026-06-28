import type { ChoiceRecord } from '../../data/progression/types';
import type { InitiationStatus } from '../initiation/types';
import type { ProgressEvaluationInput } from './types';

export function createProgressInput(
  overrides: Partial<ProgressEvaluationInput> = {},
): ProgressEvaluationInput {
  return {
    completedProgressNodeIds: [],
    choiceHistory: [],
    pathFlags: {},
    initiationStatus: {
      grove: 'available',
      alexandria: 'locked',
      rome: 'locked',
      desert: 'locked',
    },
    completedPuzzleIds: [],
    visitedWorldIds: ['grove'],
    resonance: {},
    sessionsCompleted: 0,
    spiritualDepth: 0,
    ...overrides,
  };
}

export function withGroveInitiationComplete(input: ProgressEvaluationInput): ProgressEvaluationInput {
  return {
    ...input,
    initiationStatus: { ...input.initiationStatus, grove: 'completed' as InitiationStatus },
  };
}

export function withAlexandriaInitiationComplete(input: ProgressEvaluationInput): ProgressEvaluationInput {
  return {
    ...input,
    initiationStatus: { ...input.initiationStatus, alexandria: 'completed' as InitiationStatus },
  };
}

export function withChoice(
  input: ProgressEvaluationInput,
  initiationId: string,
  choiceId: string,
  stepIndex = 0,
): ProgressEvaluationInput {
  const entry: ChoiceRecord = {
    initiationId,
    stepIndex,
    choiceId,
    at: Date.now(),
  };
  return {
    ...input,
    choiceHistory: [...input.choiceHistory, entry],
  };
}
