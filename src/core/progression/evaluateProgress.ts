import { ALL_PROGRESS_NODES } from '../../data/progression/index';
import type { ProgressCondition, ProgressNodeDef } from '../../data/progression/types';
import type { ProgressEvaluationInput, ProgressEvaluationResult } from './types';

function meetsCondition(input: ProgressEvaluationInput, condition: ProgressCondition): boolean {
  switch (condition.type) {
    case 'nodeCompleted':
      return input.completedProgressNodeIds.includes(condition.nodeId);
    case 'choiceMade':
      return input.choiceHistory.some(
        (c) => c.initiationId === condition.initiationId && c.choiceId === condition.choiceId,
      );
    case 'resonanceAtLeast':
      return (input.resonance[condition.tradition] ?? 0) >= condition.amount;
    case 'puzzleCompleted':
      return input.completedPuzzleIds.includes(condition.puzzleId);
    case 'ageVisited':
      return input.visitedWorldIds.includes(condition.worldId);
    case 'initiationCompleted':
      return input.initiationStatus[condition.worldId] === 'completed';
    case 'pathFlag': {
      const value = input.pathFlags[condition.flag];
      if (value === undefined) return false;
      if (condition.value === undefined) return true;
      return value === condition.value;
    }
    case 'spiritualDepthAtLeast':
      return input.spiritualDepth >= condition.amount;
    default:
      return false;
  }
}

function nodeRequirementsMet(input: ProgressEvaluationInput, node: ProgressNodeDef): boolean {
  if (node.requires.length === 0) return true;
  return node.requires.every((c) => meetsCondition(input, c));
}

export function evaluateProgress(input: ProgressEvaluationInput): ProgressEvaluationResult {
  const completed = new Set(input.completedProgressNodeIds);
  const newlyCompleted: string[] = [];
  let changed = true;

  while (changed) {
    changed = false;
    for (const node of ALL_PROGRESS_NODES) {
      if (completed.has(node.id)) continue;
      if (!nodeRequirementsMet(input, node)) continue;
      completed.add(node.id);
      newlyCompleted.push(node.id);
      changed = true;
    }
    input = { ...input, completedProgressNodeIds: [...completed] };
  }

  const availableNodeIds = ALL_PROGRESS_NODES.filter(
    (n) => !completed.has(n.id) && nodeRequirementsMet(input, n),
  ).map((n) => n.id);

  return {
    newlyCompletedNodeIds: newlyCompleted,
    allCompletedNodeIds: [...completed],
    availableNodeIds,
  };
}

export function isNodeCompleted(input: ProgressEvaluationInput, nodeId: string): boolean {
  return evaluateProgress(input).allCompletedNodeIds.includes(nodeId);
}
