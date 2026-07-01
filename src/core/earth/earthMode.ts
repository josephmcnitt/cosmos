import type { ObserverMode } from '../ObserverState';

/** Orbit sweet spot for the rotatable globe. */
export const EARTH_GLOBE_ENTER_EXPONENT = 10;

/** Crossing above this threshold exits earth mode back to cosmic (planetary band top). */
export const EARTH_GLOBE_EXIT_EXPONENT = 16;

export const EARTH_ORBIT_DISTANCE_MIN = 14;
export const EARTH_ORBIT_DISTANCE_MAX = 28;
export const EARTH_ORBIT_DISTANCE_DEFAULT = 20;

export type EarthPhase = 'globe' | 'descent';

export interface GeoFocus {
  lat: number;
  lng: number;
  siteAnchorId?: string;
  ageId?: string;
  label: string;
}

export interface EarthRotation {
  yaw: number;
  pitch: number;
}

export interface EarthModeState {
  mode: ObserverMode;
  spatialExponent: number;
}

export function shouldEnterEarthMode(
  state: EarthModeState,
  nextExponent: number,
  featureEnabled: boolean,
): boolean {
  if (!featureEnabled) return false;
  if (state.mode !== 'cosmic') return false;
  return state.spatialExponent > EARTH_GLOBE_EXIT_EXPONENT && nextExponent <= EARTH_GLOBE_EXIT_EXPONENT;
}

export function shouldExitEarthMode(
  state: EarthModeState,
  nextExponent: number,
  featureEnabled: boolean,
): boolean {
  if (!featureEnabled) return false;
  if (state.mode !== 'earth') return false;
  return nextExponent > EARTH_GLOBE_EXIT_EXPONENT;
}

export function clampEarthOrbitDistance(distance: number): number {
  return Math.max(EARTH_ORBIT_DISTANCE_MIN, Math.min(EARTH_ORBIT_DISTANCE_MAX, distance));
}

export function earthEnterPatch(state: Pick<EarthModeState, 'spatialExponent'>): {
  mode: 'earth';
  earthPhase: EarthPhase;
  spatialExponent: number;
  preEarthExponent: number;
  geoFocus: null;
  earthOrbitDistance: number;
} {
  return {
    mode: 'earth',
    earthPhase: 'globe',
    spatialExponent: EARTH_GLOBE_ENTER_EXPONENT,
    preEarthExponent: state.spatialExponent,
    geoFocus: null,
    earthOrbitDistance: EARTH_ORBIT_DISTANCE_DEFAULT,
  };
}

export function earthExitPatch(state: {
  preEarthExponent: number;
}): {
  mode: 'cosmic';
  spatialExponent: number;
  geoFocus: null;
} {
  return {
    mode: 'cosmic',
    spatialExponent: Math.max(state.preEarthExponent, EARTH_GLOBE_EXIT_EXPONENT + 0.5),
    geoFocus: null,
  };
}
