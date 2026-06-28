import { ALEXANDRIA_PURIFICATION_NODES } from './nodes/alexandria-purification';
import { GROVE_HERMETIC_NODES } from './nodes/grove-hermetic';
import type { ProgressNodeDef } from './types';

export const ALL_PROGRESS_NODES: ProgressNodeDef[] = [
  ...GROVE_HERMETIC_NODES,
  ...ALEXANDRIA_PURIFICATION_NODES,
];

export function getProgressNodeById(id: string): ProgressNodeDef | undefined {
  return ALL_PROGRESS_NODES.find((n) => n.id === id);
}

export function getProgressNodesForTradition(tradition: string): ProgressNodeDef[] {
  return ALL_PROGRESS_NODES.filter((n) => n.tradition === tradition);
}
