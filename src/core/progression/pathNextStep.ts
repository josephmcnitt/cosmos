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
    detail:
      'Walk to the Hermetic Corpus stone (south-west path — teal rings on the stone). Press R to rotate each ring until they align.',
  },
  'grove-hermetic-convergence': {
    title: 'Alexandria correspondence',
    detail: 'Complete the Hermetic rings puzzle, then visit Alexandria.',
  },
  'via-resonantiae-threshold': {
    title: 'Resonant threshold',
    detail: 'Practice at esoteric stones until depth rises, then visit Alexandria and Rome.',
  },
  'via-resonantiae-silent-gate': {
    title: 'Silent Gate',
    detail: 'Complete all Five Libers, practice at the Via Resonantiae stones, then discover Liber V at the Veil point.',
  },
  'via-resonantiae-liber-vi': {
    title: 'Book of Dimensions',
    detail: 'Pass the Silent Gate, then deepen practice at the Via stones until the last book opens near the Veil point.',
  },
  'via-resonantiae-overflow': {
    title: 'Witness the Overflow',
    detail: 'Leave the walk, return to the cosmic view, and scrub the timeline all the way back to the first light.',
  },
  'kabbalah-pardes': {
    title: 'Four levels of meaning',
    detail: 'Practice at the Zohar stone (south path) until the four levels of reading open.',
  },
  'kabbalah-gematria-gate': {
    title: 'Weigh the letters',
    detail: 'At the Zohar stone, press R and find the word whose letters count the same as One.',
  },
  'kabbalah-tikkun': {
    title: 'Shattering and repair',
    detail: 'Travel to Safed, speak with the Disciple of the Ari (T), and deepen Kabbalah practice.',
  },
  'agrippa-three-worlds': {
    title: 'The three worlds',
    detail: 'In Safed, weigh the square of Saturn at the Letters of Formation stone, then travel to Cologne.',
  },
  'kabbalah-overflow-mirror': {
    title: 'Two tellings, one wound',
    detail: 'Complete tikkun in Safed and witness the Overflow — the two beginnings answer each other.',
  },
};

export function isRelevantPathNode(
  input: ProgressEvaluationInput,
  node: ProgressNodeDef,
  completed: Set<string> = new Set(input.completedProgressNodeIds),
): boolean {
  const groveBranch = input.pathFlags['grove-hermetic-path'];
  if (groveBranch === 'rational' && node.id === 'grove-choice-experiential') return false;
  if (groveBranch === 'experiential' && node.id === 'grove-choice-rational') return false;

  const alexBranch = input.pathFlags['alexandria-purification-path'];
  if (alexBranch === 'correspondence' && node.id === 'alexandria-choice-silence') return false;
  if (alexBranch === 'silence' && node.id === 'alexandria-choice-correspondence') return false;

  if (node.id === 'grove-hermetic-rings' && completed.has('grove-hermetic-convergence')) {
    return false;
  }
  if (node.id === 'grove-hermetic-rings' && input.completedPuzzleIds.includes('puzzle-hermetic-rings')) {
    return false;
  }
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
    (node) => !completed.has(node.id) && isRelevantPathNode(input, node, completed),
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
