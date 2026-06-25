import { clampSimTime } from './TimeSpace';
import { computeHeavenVisuals, FIRST_STARS_SECONDS } from './materialHeavens';
import type { ObserverMode } from './ObserverState';

/** Replay window ends well before first stars — matches CMB glow falloff. */
export const BIG_BANG_REPLAY_END_SECONDS = FIRST_STARS_SECONDS * 0.35;

export interface BigBangReplayFrame {
  /** 0 = ignition, 1 = expanded shell fading out. */
  burstT: number;
  /** Overall visibility multiplier. */
  intensity: number;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Map sim time near Big Bang to explosion replay frame, or null when inactive. */
export function bigBangReplayFrame(simTimeSeconds: number): BigBangReplayFrame | null {
  const t = clampSimTime(simTimeSeconds);
  if (t >= BIG_BANG_REPLAY_END_SECONDS) return null;

  const progress = t / BIG_BANG_REPLAY_END_SECONDS;
  const burstT = Math.min(1, progress * 1.35);
  const fade = 1 - smoothstep(0.65, 1, progress);
  const cmb = computeHeavenVisuals(t).cmbGlow;
  const intensity = fade * (0.45 + cmb * 0.55);

  if (intensity < 0.04) return null;
  return { burstT, intensity };
}

export function isBigBangReplayActive(
  simTimeSeconds: number,
  mode: ObserverMode,
  introComplete: boolean,
): boolean {
  if (!introComplete || mode !== 'cosmic') return false;
  return bigBangReplayFrame(simTimeSeconds) != null;
}
