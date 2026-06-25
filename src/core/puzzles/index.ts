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

export function checkEraWitness(puzzleId: string, witnessedEventIds: string[]): boolean {
  const template = getPuzzleById(puzzleId);
  if (!template?.witnessEventId) return false;
  return witnessedEventIds.includes(template.witnessEventId);
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
    default:
      return '';
  }
}
