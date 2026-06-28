import { ALL_PROGRESS_NODES } from '../../data/progression/index';
import type { ProgressNodeDef } from '../../data/progression/types';
import { areProgressNodeRequirementsMet } from './evaluateProgress';
import type { ProgressEvaluationInput } from './types';

export interface PathNextStep {
  nodeId: string;
  title: string;
  detail?: string;
  ready: boolean;
}

const PUZZLE_STEP_HINTS: Record<string, { title: string; detail: string }> = {
  'grove-hermetic-rings': {
    title: 'Hermetic ring puzzle',
    detail: 'Walk to the teal Hermetic stone and press R to rotate the ring sequence.',
  },
  'grove-hermetic-convergence': {
    title: 'Alexandria correspondence',
    detail: 'Complete the Hermetic rings puzzle, then visit Alexandria.',
  },
};

function isRelevantPathNode(input: ProgressEvaluationInput, node: ProgressNodeDef): boolean {
  const branch = input.pathFlags['grove-hermetic-path'];
  if (branch === 'rational' && node.id === 'grove-choice-experiential') return false;
  if (branch === 'experiential' && node.id === 'grove-choice-rational') return false;
  return true;
}

function stepPresentation(node: ProgressNodeDef): { title: string; detail?: string } {
  const hint = PUZZLE_STEP_HINTS[node.id];
  if (hint) return hint;
  return { title: node.title };
}

/** First incomplete node on the player's route — ready when requirements are met now. */
export function getPathNextStep(input: ProgressEvaluationInput): PathNextStep | null {
  const completed = new Set(input.completedProgressNodeIds);
  const pending = ALL_PROGRESS_NODES.filter(
    (node) => !completed.has(node.id) && isRelevantPathNode(input, node),
  );
  if (pending.length === 0) return null;

  const ready = pending.find((node) => areProgressNodeRequirementsMet(input, node.id));
  const target = ready ?? pending[0]!;
  const presentation = stepPresentation(target);

  return {
    nodeId: target.id,
    title: presentation.title,
    detail: presentation.detail,
    ready: ready != null,
  };
}
