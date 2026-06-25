import type { SpiritualTradition } from '../data/history/types';
import { MARKER_TRADITION_COLORS } from '../data/embodied/siteMarkers';

export type RealmPhase = 'material' | 'liminal' | 'spiritual';

export const REALM_TRANSITION_SEC = 1.0;
export const EMBODIMENT_TRANSITION_MS = 400;

const PHASE_WEIGHT: Record<RealmPhase, number> = {
  material: 0,
  liminal: 1,
  spiritual: 2,
};

export function phaseWeight(phase: RealmPhase): number {
  return PHASE_WEIGHT[phase];
}

export function stepToward(current: number, target: number, dtSec: number, durationSec: number): number {
  if (Math.abs(target - current) < 0.001) return target;
  const step = dtSec / durationSec;
  if (current < target) return Math.min(target, current + step * Math.max(0.25, target - current + 0.5));
  return Math.max(target, current - step * Math.max(0.25, current - target + 0.5));
}

export function weightsFromDisplay(displayWeight: number): {
  material: number;
  liminal: number;
  spiritual: number;
} {
  const w = Math.max(0, Math.min(2, displayWeight));
  if (w <= 1) {
    return { material: 1 - w, liminal: w, spiritual: 0 };
  }
  const t = w - 1;
  return { material: 0, liminal: 1 - t, spiritual: t };
}

export function traditionAccent(tradition: SpiritualTradition | null): string {
  if (!tradition) return '#7868a8';
  return MARKER_TRADITION_COLORS[tradition] ?? '#7868a8';
}

export function fogDistances(embodied: boolean, liminal: number, spiritual: number): {
  near: number;
  far: number;
} {
  const cosmicNear = 80;
  const cosmicFar = 350;
  const walkNear = 15;
  const walkFar = 55;
  const realmPull = liminal * 0.35 + spiritual * 0.65;
  const near = embodied ? walkNear + (1 - realmPull) * 0 : cosmicNear;
  const far = embodied
    ? walkFar - realmPull * 8
    : cosmicFar;
  return { near, far };
}
