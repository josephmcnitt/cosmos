import { GROVE_HERMETIC_NODES } from './nodes/grove-hermetic';
import { ALEXANDRIA_WORLD_POLISH_NODES } from './nodes/alexandria-world-polish';
import type { ProgressNodeDef } from './types';

export const ALL_PROGRESS_NODES: ProgressNodeDef[] = [
  ...GROVE_HERMETIC_NODES,
  ...ALEXANDRIA_WORLD_POLISH_NODES,
];

export function getProgressNodeById(id: string): ProgressNodeDef | undefined {
  return ALL_PROGRESS_NODES.find((n) => n.id === id);
}

export function getProgressNodesForTradition(tradition: string): ProgressNodeDef[] {
  return ALL_PROGRESS_NODES.filter((n) => n.tradition === tradition);
}
