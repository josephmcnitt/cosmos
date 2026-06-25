import { describe, expect, it } from 'vitest';
import { yearsAfterBB } from '../data/history/time';
import {
  computeHeavenVisuals,
  FIRST_STARS_SECONDS,
  REIONIZATION_SECONDS,
} from './materialHeavens';

describe('computeHeavenVisuals', () => {
  it('returns darkAges before first stars with low starfield and ambient', () => {
    const v = computeHeavenVisuals(yearsAfterBB(50e6));
    expect(v.phase).toBe('darkAges');
    expect(v.starfieldOpacity).toBeLessThan(0.15);
    expect(v.ambientScale).toBeLessThan(0.3);
    expect(v.fogDensity).toBeGreaterThan(0.9);
  });

  it('returns firstLight between first stars and reionization', () => {
    const mid = (FIRST_STARS_SECONDS + REIONIZATION_SECONDS) / 2;
    const v = computeHeavenVisuals(mid);
    expect(v.phase).toBe('firstLight');
    expect(v.starfieldOpacity).toBeGreaterThan(0.06);
    expect(v.starfieldOpacity).toBeLessThan(1);
    expect(v.bandScale.galaxy).toBeGreaterThan(0.08);
    expect(v.bandScale.galaxy).toBeLessThan(1);
  });

  it('returns reionized after reionization with full starfield', () => {
    const v = computeHeavenVisuals(REIONIZATION_SECONDS * 1.2);
    expect(v.phase).toBe('reionized');
    expect(v.starfieldOpacity).toBeGreaterThan(0.85);
    expect(v.bandScale.galaxy).toBeGreaterThan(0.85);
    expect(v.ambientScale).toBeCloseTo(0.45, 1);
  });

  it('starfield opacity is monotonic as time advances', () => {
    const samples = [
      0,
      yearsAfterBB(100e6),
      FIRST_STARS_SECONDS,
      (FIRST_STARS_SECONDS + REIONIZATION_SECONDS) / 2,
      REIONIZATION_SECONDS,
      yearsAfterBB(5e9),
    ];
    let prev = 0;
    for (const t of samples) {
      const opacity = computeHeavenVisuals(t).starfieldOpacity;
      expect(opacity).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = opacity;
    }
  });

  it('cmbGlow fades after early universe', () => {
    expect(computeHeavenVisuals(0).cmbGlow).toBeGreaterThan(0.5);
    expect(computeHeavenVisuals(FIRST_STARS_SECONDS).cmbGlow).toBeLessThan(0.1);
  });
});
