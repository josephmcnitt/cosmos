import { GROVE_AGE } from './grove';
import { ALEXANDRIA_AGE } from './alexandria';
import { ROME_AGE } from './rome';
import { DESERT_AGE } from './desert';
import { PUZZLE_TEMPLATES } from './puzzles';
import type { AgeDefinition, PuzzleTemplate } from './types';

export const ALL_AGES: AgeDefinition[] = [GROVE_AGE, ALEXANDRIA_AGE, ROME_AGE, DESERT_AGE];

export { GROVE_AGE, ALEXANDRIA_AGE, ROME_AGE, DESERT_AGE, PUZZLE_TEMPLATES };
export type { AgeDefinition, AgeMarkerDef, PuzzleTemplate } from './types';

export function getAgeById(id: string): AgeDefinition | undefined {
  return ALL_AGES.find((a) => a.id === id);
}

export function getPuzzleById(id: string): PuzzleTemplate | undefined {
  return PUZZLE_TEMPLATES.find((p) => p.id === id);
}
