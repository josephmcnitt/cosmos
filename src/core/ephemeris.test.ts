import { describe, expect, it } from 'vitest';
import {
  azAltToDirection,
  computeEphemeris,
  ephemerisDayAmbientBoost,
  REFERENCE_DATE,
} from './ephemeris';

describe('ephemeris', () => {
  it('Sun above horizon at noon Athens on reference solstice', () => {
    const eph = computeEphemeris(REFERENCE_DATE);
    expect(eph.sunAltitude).toBeGreaterThan(0);
    expect(eph.sunAltitude).toBeGreaterThan(0.5);
  });

  it('moon phase in [0, 1]', () => {
    const eph = computeEphemeris();
    expect(eph.moonPhase).toBeGreaterThanOrEqual(0);
    expect(eph.moonPhase).toBeLessThanOrEqual(1);
  });

  it('azimuths in valid range', () => {
    const eph = computeEphemeris();
    expect(eph.sunAzimuth).toBeGreaterThanOrEqual(0);
    expect(eph.sunAzimuth).toBeLessThan(Math.PI * 2);
    expect(eph.moonAzimuth).toBeGreaterThanOrEqual(0);
    expect(eph.moonAzimuth).toBeLessThan(Math.PI * 2);
  });

  it('azAltToDirection is unit length', () => {
    const [x, y, z] = azAltToDirection(1, 0.5);
    const len = Math.hypot(x, y, z);
    expect(len).toBeCloseTo(1, 5);
  });

  it('ephemerisDayAmbientBoost positive when Sun up', () => {
    expect(ephemerisDayAmbientBoost(0.8)).toBeGreaterThan(0);
    expect(ephemerisDayAmbientBoost(-0.1)).toBe(0);
  });
});
