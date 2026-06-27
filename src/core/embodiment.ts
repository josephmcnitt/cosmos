import { useIntroStore } from './IntroState';
import { useHistoryStore } from './HistoryState';
import { usePracticeStore } from './PracticeState';
import type { ObserverMode, ObserverState } from './ObserverState';
import { isHumanSpatialBand, isInHumanEra } from './spatialTimeCoupling';

export const EMBODIED_ENTER_EXPONENT = 4.0;
export const EMBODIED_EXIT_EXPONENT = 3.5;
export const EMBODIED_APPROACH_START = 12;
export const EMBODIED_APPROACH_END = 4.5;

export const EMBODIED_CAMERA_MIN = 2.5;
export const EMBODIED_CAMERA_MAX = 8;
export const EMBODIED_CAMERA_DEFAULT = 5;

import { useWorldStore } from './world/WorldState';
import { getSiteHalfSize } from './world/worldQueries';

export const SITE_HALF_SIZE = 18;
export const AVATAR_WALK_SPEED = 4;
export const AVATAR_TURN_SPEED = 2.8;
export const AVATAR_HEIGHT = 0.9;

/** Until Grove initiation is done, walk mode always starts in Plato's Grove. */
export function ensureOnboardingEmbodiedWorld(): void {
  const world = useWorldStore.getState();
  if (world.getInitiationStatus('grove') === 'completed') return;
  if (world.currentWorldId === 'grove') return;
  world.travelToWorld('grove');
}

/** Walk mode is for uncovering hidden spiritual / esoteric history. */
export function prepareEmbodiedDiscovery(): void {
  ensureOnboardingEmbodiedWorld();
  const history = useHistoryStore.getState();
  history.setHistoryTrack('spiritual');
  history.setDepthOfView('full');
  history.setDomainFilter('all');
  history.setTraditionFilter('all');
}

export interface EmbodimentContext {
  introComplete: boolean;
  isFlying: boolean;
}

export function getEmbodimentContext(): EmbodimentContext {
  return {
    introComplete: useIntroStore.getState().phase === 'complete',
    isFlying: useHistoryStore.getState().isFlying,
  };
}

export function embodimentApproachWeight(exponent: number): number {
  if (exponent >= EMBODIED_APPROACH_START) return 0;
  if (exponent <= EMBODIED_APPROACH_END) return 1;
  return (EMBODIED_APPROACH_START - exponent) / (EMBODIED_APPROACH_START - EMBODIED_APPROACH_END);
}

export function shouldEnterEmbodied(
  state: Pick<ObserverState, 'mode' | 'spatialExponent' | 'simTimeSeconds'>,
  ctx: EmbodimentContext,
): boolean {
  if (state.mode === 'embodied') return false;
  if (!ctx.introComplete || ctx.isFlying) return false;
  if (!isInHumanEra(state.simTimeSeconds)) return false;
  if (!isHumanSpatialBand(state.spatialExponent)) return false;
  return embodimentApproachWeight(state.spatialExponent) >= 1;
}

export function shouldExitEmbodiedFromSpatial(
  state: Pick<ObserverState, 'mode' | 'spatialExponent'>,
): boolean {
  if (state.mode !== 'embodied') return false;
  return state.spatialExponent < EMBODIED_EXIT_EXPONENT;
}

export function shouldExitEmbodiedFromTime(
  state: Pick<ObserverState, 'mode' | 'simTimeSeconds'>,
): boolean {
  if (state.mode !== 'embodied') return false;
  return !isInHumanEra(state.simTimeSeconds);
}

export function clampAvatarToSite(x: number, z: number): { x: number; z: number } {
  const half = getSiteHalfSize();
  return {
    x: Math.max(-half, Math.min(half, x)),
    z: Math.max(-half, Math.min(half, z)),
  };
}

export function sampleTerrainHeight(x: number, z: number): number {
  return (
    Math.sin(x * 0.25) * 0.15 +
    Math.cos(z * 0.2) * 0.12 +
    Math.sin((x + z) * 0.15) * 0.08
  );
}

export function isEmbodiedMode(mode: ObserverMode): boolean {
  return mode === 'embodied';
}

/** Spatial exponent after leaving walk — must stay below enter threshold to avoid re-entry. */
export function spatialExponentAfterExitEmbodied(preEmbodimentExponent: number): number {
  if (preEmbodimentExponent < EMBODIED_ENTER_EXPONENT) {
    return preEmbodimentExponent;
  }
  return EMBODIED_EXIT_EXPONENT - 0.25;
}

/** Clears session practice / realm state when leaving walk mode. Progress persists in WorldState. */
export function resetEmbodiedPractice(): void {
  usePracticeStore.getState().resetSession();
}
