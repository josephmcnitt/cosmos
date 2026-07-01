import { describe, expect, it } from 'vitest';
import {
  EARTH_GLOBE_ENTER_EXPONENT,
  EARTH_GLOBE_EXIT_EXPONENT,
  clampEarthOrbitDistance,
  earthEnterPatch,
  earthExitPatch,
  shouldEnterEarthMode,
  shouldExitEarthMode,
} from './earthMode';

describe('earthMode transitions', () => {
  it('enters earth when crossing exit threshold from cosmic', () => {
    expect(
      shouldEnterEarthMode({ mode: 'cosmic', spatialExponent: 18 }, 15, true),
    ).toBe(true);
    expect(
      shouldEnterEarthMode({ mode: 'cosmic', spatialExponent: 18 }, 17, true),
    ).toBe(false);
    expect(
      shouldEnterEarthMode({ mode: 'cosmic', spatialExponent: 18 }, 15, false),
    ).toBe(false);
    expect(
      shouldEnterEarthMode({ mode: 'earth', spatialExponent: 10 }, 9, true),
    ).toBe(false);
  });

  it('exits earth when zooming above exit threshold', () => {
    expect(
      shouldExitEarthMode({ mode: 'earth', spatialExponent: 10 }, 17, true),
    ).toBe(true);
    expect(
      shouldExitEarthMode({ mode: 'earth', spatialExponent: 10 }, 15, true),
    ).toBe(false);
    expect(
      shouldExitEarthMode({ mode: 'cosmic', spatialExponent: 14 }, 18, true),
    ).toBe(false);
  });

  it('earthEnterPatch clamps to enter exponent', () => {
    const patch = earthEnterPatch({ spatialExponent: 14 });
    expect(patch.mode).toBe('earth');
    expect(patch.spatialExponent).toBe(EARTH_GLOBE_ENTER_EXPONENT);
    expect(patch.preEarthExponent).toBe(14);
    expect(patch.geoFocus).toBeNull();
  });

  it('earthExitPatch restores pre-earth exponent above exit band', () => {
    const patch = earthExitPatch({ preEarthExponent: 14 });
    expect(patch.mode).toBe('cosmic');
    expect(patch.spatialExponent).toBe(EARTH_GLOBE_EXIT_EXPONENT + 0.5);
    expect(patch.geoFocus).toBeNull();
  });

  it('earthExitPatch keeps high pre-earth exponent', () => {
    const patch = earthExitPatch({ preEarthExponent: 22 });
    expect(patch.spatialExponent).toBe(22);
  });

  it('uses expected threshold constants', () => {
    expect(EARTH_GLOBE_ENTER_EXPONENT).toBeLessThan(EARTH_GLOBE_EXIT_EXPONENT);
  });

  it('clamps orbit distance', () => {
    expect(clampEarthOrbitDistance(5)).toBeGreaterThan(5);
    expect(clampEarthOrbitDistance(100)).toBeLessThan(100);
  });
});
