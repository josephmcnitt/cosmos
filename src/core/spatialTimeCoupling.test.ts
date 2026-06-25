import { describe, expect, it } from 'vitest';
import { TEMPORAL_MAX, UNIVERSE_AGE_SECONDS } from './TimeSpace';
import {
  computeEffectiveTimeWindow,
  eventBelongsToSpatialBand,
  isHumanSpatialBand,
  isInHumanEra,
} from './spatialTimeCoupling';

describe('isInHumanEra', () => {
  it('is true at present', () => {
    expect(isInHumanEra(UNIVERSE_AGE_SECONDS)).toBe(true);
  });

  it('is false at big bang', () => {
    expect(isInHumanEra(1)).toBe(false);
  });
});

describe('isHumanSpatialBand', () => {
  it('identifies human band exponent', () => {
    expect(isHumanSpatialBand(4)).toBe(true);
    expect(isHumanSpatialBand(25)).toBe(false);
  });
});

describe('eventBelongsToSpatialBand', () => {
  it('matches explicit spatialBand', () => {
    expect(eventBelongsToSpatialBand({ spatialBand: 'human' }, 'human')).toBe(true);
    expect(eventBelongsToSpatialBand({ spatialBand: 'human' }, 'galaxy')).toBe(false);
  });

  it('falls back to domain default', () => {
    expect(eventBelongsToSpatialBand({ domain: 'cosmic' }, 'galaxy')).toBe(true);
  });
});

describe('computeEffectiveTimeWindow', () => {
  it('narrows view labels when temporal zoom increases', () => {
    const wide = computeEffectiveTimeWindow(25, UNIVERSE_AGE_SECONDS * 0.5, 0);
    const narrow = computeEffectiveTimeWindow(25, UNIVERSE_AGE_SECONDS * 0.5, TEMPORAL_MAX);
    expect(narrow.viewMaxSeconds - narrow.viewMinSeconds).toBeLessThan(
      wide.viewMaxSeconds - wide.viewMinSeconds,
    );
  });

  it('narrows more aggressively in the second half of the slider', () => {
    const mid = computeEffectiveTimeWindow(25, 1, TEMPORAL_MAX / 2);
    const high = computeEffectiveTimeWindow(25, 1, TEMPORAL_MAX * 0.75);
    const midSpan = mid.viewMaxLog - mid.viewMinLog;
    const highSpan = high.viewMaxLog - high.viewMinLog;
    expect(highSpan).toBeLessThan(midSpan);
  });

  it('keeps window edges stable when simTime moves inside a anchored view', () => {
    const anchorLog = 3;
    const early = computeEffectiveTimeWindow(25, 100, TEMPORAL_MAX / 2, {
      viewCenterLog: anchorLog,
    });
    const later = computeEffectiveTimeWindow(25, 500, TEMPORAL_MAX / 2, {
      viewCenterLog: anchorLog,
    });
    expect(later.viewMinLog).toBeCloseTo(early.viewMinLog, 5);
    expect(later.viewMaxLog).toBeCloseTo(early.viewMaxLog, 5);
  });
});
