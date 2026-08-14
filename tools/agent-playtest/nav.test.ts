import { describe, expect, it } from 'vitest';
import { ARRIVE_DISTANCE, normalizeAngle, planNavStep } from './nav';

describe('normalizeAngle', () => {
  it('wraps into [-PI, PI]', () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(-Math.PI);
  });
});

describe('planNavStep', () => {
  it('arrives when within range', () => {
    const step = planNavStep(0, 0, 0, 0, ARRIVE_DISTANCE - 0.5);
    expect(step.forward).toBe(false);
    expect(step.turn).toBeNull();
  });

  it('moves straight ahead when facing the target', () => {
    // heading (sin 0, cos 0) = +z; target directly ahead on +z
    const step = planNavStep(0, 0, 0, 0, 10);
    expect(step.turn).toBeNull();
    expect(step.forward).toBe(true);
  });

  it('turns left (a) toward a target on the +x side', () => {
    // desired yaw = atan2(10, 0) = PI/2 > 0 → 'a' increases yaw
    const step = planNavStep(0, 0, 0, 10, 0);
    expect(step.turn).toBe('a');
    expect(step.forward).toBe(false);
  });

  it('turns right (d) toward a target on the -x side', () => {
    const step = planNavStep(0, 0, 0, -10, 0);
    expect(step.turn).toBe('d');
  });

  it('walks and steers on small angle error', () => {
    const step = planNavStep(0, 0, 0.3, 0, 10);
    expect(step.turn).toBe('d');
    expect(step.forward).toBe(true);
  });
});
