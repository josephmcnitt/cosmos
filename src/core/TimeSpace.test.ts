import { describe, expect, it } from 'vitest';
import { TEMPORAL_MAX, formatSimTimeWindowEdge } from './TimeSpace';
import { computeEffectiveTimeWindow } from './spatialTimeCoupling';

describe('formatSimTimeWindowEdge', () => {
  it('uses distinct labels for a zoomed window at the Big Bang', () => {
    const window = computeEffectiveTimeWindow(25, 1, TEMPORAL_MAX);
    const span = window.viewMaxLog - window.viewMinLog;
    const minLabel = formatSimTimeWindowEdge(window.viewMinSeconds, span);
    const maxLabel = formatSimTimeWindowEdge(window.viewMaxSeconds, span);
    expect(minLabel).not.toBe(maxLabel);
    expect(minLabel).not.toBe('13.8 Gya');
  });

  it('falls back to short labels for a wide view', () => {
    const window = computeEffectiveTimeWindow(25, 1, 0);
    const span = window.viewMaxLog - window.viewMinLog;
    expect(formatSimTimeWindowEdge(window.viewMinSeconds, span)).toBe('13.8 Gya');
  });
});
