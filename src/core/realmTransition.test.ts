import { describe, expect, it } from 'vitest';
import { fogDistances, phaseWeight, stepToward, weightsFromDisplay } from './realmTransition';

describe('realmTransition', () => {
  it('maps phases to ordered weights', () => {
    expect(phaseWeight('material')).toBe(0);
    expect(phaseWeight('liminal')).toBe(1);
    expect(phaseWeight('spiritual')).toBe(2);
  });

  it('interpolates display weights between phases', () => {
    const mid = weightsFromDisplay(0.5);
    expect(mid.material).toBeCloseTo(0.5);
    expect(mid.liminal).toBeCloseTo(0.5);
    expect(mid.spiritual).toBe(0);
  });

  it('steps toward target over time', () => {
    const next = stepToward(0, 2, 0.5, 1);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(2);
  });

  it('lerps fog when embodied and spiritual', () => {
    const walk = fogDistances(true, 0, 1);
    expect(walk.far).toBeLessThan(55);
    const cosmic = fogDistances(false, 1, 1);
    expect(cosmic.near).toBe(80);
  });
});
