import { getPuzzleById } from '../../data/ages/index';

export function rotateRing(current: number[], ringIndex: number): number[] {
  const next = [...current];
  next[ringIndex] = ((next[ringIndex] ?? 0) + 1) % 4;
  return next;
}

export function checkRingAlignment(puzzleId: string, rotations: number[]): boolean {
  const template = getPuzzleById(puzzleId);
  if (!template?.ringSequence) return false;
  return template.ringSequence.every((expected, i) => rotations[i] === expected);
}

export function checkThresholdStance(
  _puzzleId: string,
  playerX: number,
  playerZ: number,
  markerX: number,
  markerZ: number,
  holdSec: number,
): boolean {
  if (holdSec < 5) return false;
  const dx = playerX - markerX;
  const dz = playerZ - markerZ;
  const dist = Math.sqrt(dx * dx + dz * dz);
  return dist <= 2.5;
}

/**
 * ~475 years. Witnessing an era requires scrubbing the cosmic timeline near
 * its witness event. Must stay well under the years-ago distance of the most
 * recent witness event (Islam, ~1400 years) or sitting at the present would
 * witness late-antique eras for free and auto-unlock their ages.
 */
export const ERA_WITNESS_WINDOW_SEC = 1.5e10;

export function isWithinEraWitnessWindow(
  simTimeSeconds: number,
  witnessSimTimeSeconds: number,
): boolean {
  return Math.abs(simTimeSeconds - witnessSimTimeSeconds) < ERA_WITNESS_WINDOW_SEC;
}

export function checkEraWitness(puzzleId: string, witnessedEventIds: string[]): boolean {
  const template = getPuzzleById(puzzleId);
  if (!template?.witnessEventId) return false;
  return witnessedEventIds.includes(template.witnessEventId);
}

export function checkGematria(puzzleId: string, optionId: string): boolean {
  const template = getPuzzleById(puzzleId);
  if (!template?.gematria) return false;
  return template.gematria.answerId === optionId;
}

export function puzzleHintFor(puzzleId: string): string {
  const template = getPuzzleById(puzzleId);
  if (!template) return '';
  switch (template.type) {
    case 'ring-alignment':
      return 'Align the three rings to the Hermetic sequence hinted in the scroll.';
    case 'threshold-stance':
      return 'Stand at the stone and hold still long enough to feel the threshold.';
    case 'era-witness':
      return 'Witness the linked era in cosmic view, then return to the Grove.';
    case 'gematria':
      return 'The text hides a number. Weigh the letters until the hidden meaning balances.';
    default:
      return '';
  }
}

/** Short on-screen prompt for the primary interaction key at a puzzle stone. */
export function puzzleActionHint(puzzleId: string): string {
  const template = getPuzzleById(puzzleId);
  if (!template) return '';
  switch (template.type) {
    case 'ring-alignment':
      return 'Press R to rotate the ring sequence.';
    case 'threshold-stance':
      return 'This stone needs stillness — hold Q, then stand still here (R does nothing).';
    case 'era-witness':
      return 'Witness the linked era in cosmic view, then return to the Grove.';
    case 'gematria':
      return 'Press R to weigh the letters.';
    default:
      return '';
  }
}
