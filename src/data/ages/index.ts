import { GROVE_AGE } from './grove';
import { ALEXANDRIA_AGE } from './alexandria';
import { ROME_AGE } from './rome';
import { DESERT_AGE } from './desert';
import { BYZANTIUM_AGE } from './byzantium';
import { CORDOBA_AGE } from './cordoba';
import { SAFED_AGE } from './safed';
import { COLOGNE_AGE } from './cologne';
import { PUZZLE_TEMPLATES } from './puzzles';
import type { AgeDefinition, PuzzleTemplate } from './types';

export const ALL_AGES: AgeDefinition[] = [
  GROVE_AGE,
  ALEXANDRIA_AGE,
  ROME_AGE,
  DESERT_AGE,
  BYZANTIUM_AGE,
  CORDOBA_AGE,
  SAFED_AGE,
  COLOGNE_AGE,
];

export {
  GROVE_AGE,
  ALEXANDRIA_AGE,
  ROME_AGE,
  DESERT_AGE,
  BYZANTIUM_AGE,
  CORDOBA_AGE,
  SAFED_AGE,
  COLOGNE_AGE,
  PUZZLE_TEMPLATES,
};
export type { AgeDefinition, AgeMarkerDef, PuzzleTemplate } from './types';

export function getAgeById(id: string): AgeDefinition | undefined {
  return ALL_AGES.find((a) => a.id === id);
}

export function getPuzzleById(id: string): PuzzleTemplate | undefined {
  return PUZZLE_TEMPLATES.find((p) => p.id === id);
}
