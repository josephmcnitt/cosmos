import { describe, expect, it } from 'vitest';
import { UNIVERSE_AGE_SECONDS } from './TimeSpace';
import { HUMAN_ERA_MIN_SECONDS } from './spatialTimeCoupling';
import {
  isBandMeshBand,
  isCosmicSkyActive,
  isEphemerisBand,
  isNearPresent,
  starfieldBrightness,
} from './heavenVisibility';

describe('heavenVisibility', () => {
  it('isNearPresent only near UNIVERSE_AGE_SECONDS', () => {
    expect(isNearPresent(UNIVERSE_AGE_SECONDS)).toBe(true);
    expect(isNearPresent(UNIVERSE_AGE_SECONDS - 50 * 365.25 * 24 * 3600)).toBe(true);
    expect(isNearPresent(HUMAN_ERA_MIN_SECONDS)).toBe(false);
  });

  it('isCosmicSkyActive requires intro complete cosmic mode', () => {
    expect(isCosmicSkyActive(true, 'cosmic')).toBe(true);
    expect(isCosmicSkyActive(false, 'cosmic')).toBe(false);
    expect(isCosmicSkyActive(true, 'embodied')).toBe(false);
  });

  it('isBandMeshBand below exponent 22', () => {
    expect(isBandMeshBand(21)).toBe(true);
    expect(isBandMeshBand(22)).toBe(false);
    expect(isBandMeshBand(25)).toBe(false);
  });

  it('isEphemerisBand at present human-era Earth scale only', () => {
    expect(isEphemerisBand(UNIVERSE_AGE_SECONDS, 12, 'cosmic', true)).toBe(true);
    expect(isEphemerisBand(UNIVERSE_AGE_SECONDS, 25, 'cosmic', true)).toBe(false);
    expect(isEphemerisBand(HUMAN_ERA_MIN_SECONDS, 12, 'cosmic', true)).toBe(false);
    expect(isEphemerisBand(UNIVERSE_AGE_SECONDS, 12, 'embodied', true)).toBe(false);
    expect(isEphemerisBand(UNIVERSE_AGE_SECONDS, 4, 'cosmic', true)).toBe(false);
  });

  it('starfieldBrightness never drops below floor', () => {
    expect(starfieldBrightness(0.06)).toBeGreaterThanOrEqual(0.2);
    expect(starfieldBrightness(1)).toBeCloseTo(1, 2);
  });
});
