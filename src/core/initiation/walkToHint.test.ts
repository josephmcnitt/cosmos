import { describe, expect, it } from 'vitest';
import { walkToHint } from './walkToHint';

describe('walkToHint', () => {
  it('reports arrival inside radius', () => {
    const hint = walkToHint(0, 0, 0, 2, 0, 3);
    expect(hint.atTarget).toBe(true);
    expect(hint.bearingLabel).toBe('you are here');
  });

  it('reports ahead when target is in front', () => {
    const hint = walkToHint(0, 0, 0, 0, 10, 3);
    expect(hint.atTarget).toBe(false);
    expect(hint.bearingLabel).toBe('ahead');
    expect(hint.distanceM).toBeCloseTo(10);
  });

  it('reports left when target is to the left', () => {
    const hint = walkToHint(0, 0, 0, -10, 0, 3);
    expect(hint.bearingLabel).toBe('to your left');
  });
});
