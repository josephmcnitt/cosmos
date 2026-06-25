import type { ObserverMode } from './ObserverState';
import { isInHumanEra } from './spatialTimeCoupling';
import { UNIVERSE_AGE_SECONDS } from './TimeSpace';

const YEAR_SECONDS = 365.25 * 24 * 3600;

/** Within ~100 years of present — matches HUD "Present" label threshold. */
export const PRESENT_THRESHOLD_SECONDS = 100 * YEAR_SECONDS;

export const EPHEMERIS_MIN_EXPONENT = 6;
export const EPHEMERIS_MAX_EXPONENT = 22;
export const BAND_MESH_MAX_EXPONENT = 22;

export function isNearPresent(simTimeSeconds: number): boolean {
  return simTimeSeconds >= UNIVERSE_AGE_SECONDS - PRESENT_THRESHOLD_SECONDS;
}

export function isCosmicSkyActive(introComplete: boolean, mode: ObserverMode): boolean {
  return introComplete && mode === 'cosmic';
}

export function isBandMeshBand(spatialExponent: number): boolean {
  return spatialExponent < BAND_MESH_MAX_EXPONENT;
}

export function isEphemerisBand(
  simTimeSeconds: number,
  spatialExponent: number,
  mode: ObserverMode,
  introComplete: boolean,
): boolean {
  if (!isCosmicSkyActive(introComplete, mode)) return false;
  if (!isInHumanEra(simTimeSeconds)) return false;
  if (!isNearPresent(simTimeSeconds)) return false;
  return spatialExponent >= EPHEMERIS_MIN_EXPONENT && spatialExponent < EPHEMERIS_MAX_EXPONENT;
}

/** Map raw starfield opacity (0.06–1) to visible brightness with a safe floor for E2E. */
export function starfieldBrightness(starfieldOpacity: number): number {
  return Math.max(0.2, 0.12 + starfieldOpacity * 0.88);
}
