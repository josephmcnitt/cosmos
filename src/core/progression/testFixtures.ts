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

export function withRomeInitiationComplete(input: ProgressEvaluationInput): ProgressEvaluationInput {
  return {
    ...input,
    initiationStatus: { ...input.initiationStatus, rome: 'completed' as InitiationStatus },
  };
}

export function withChoice(
  input: ProgressEvaluationInput,
  initiationId: string,
  choiceId: string,
  stepIndex = 6,
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

export function withPuzzleCompleted(
  input: ProgressEvaluationInput,
  puzzleId: string,
): ProgressEvaluationInput {
  if (input.completedPuzzleIds.includes(puzzleId)) return input;
  return {
    ...input,
    completedPuzzleIds: [...input.completedPuzzleIds, puzzleId],
  };
}

export function withAgeVisited(
  input: ProgressEvaluationInput,
  worldId: string,
): ProgressEvaluationInput {
  if (input.visitedWorldIds.includes(worldId)) return input;
  return {
    ...input,
    visitedWorldIds: [...input.visitedWorldIds, worldId],
  };
}

/** Grove initiation done + hermetic-rational fork choice recorded. */
export function rationalPathInput(
  overrides: Partial<ProgressEvaluationInput> = {},
): ProgressEvaluationInput {
  let input = withGroveInitiationComplete(createProgressInput());
  input = withChoice(input, 'initiation-grove', 'hermetic-rational');
  return { ...input, ...overrides };
}

/** Grove initiation done + hermetic-experiential fork choice recorded. */
export function experientialPathInput(
  overrides: Partial<ProgressEvaluationInput> = {},
): ProgressEvaluationInput {
  let input = withGroveInitiationComplete(createProgressInput());
  input = withChoice(input, 'initiation-grove', 'hermetic-experiential');
  return { ...input, ...overrides };
}
