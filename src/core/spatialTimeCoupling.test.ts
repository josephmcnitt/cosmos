import { describe, expect, it } from 'vitest';
import { UNIVERSE_AGE_SECONDS } from './TimeSpace';
import {
  computeEffectiveTimeWindow,
  eventBelongsToSpatialBand,
  isHumanSpatialBand,
  isInHumanEra,
} from './spatialTimeCoupling';
import { TEMPORAL_MAX } from './TimeSpace';

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

describe('computeEffectiveTimeWindow view labels', () => {
  it('narrows view labels when temporal zoom increases', () => {
    const wide = computeEffectiveTimeWindow(25, UNIVERSE_AGE_SECONDS, 0);
    const narrow = computeEffectiveTimeWindow(25, UNIVERSE_AGE_SECONDS, TEMPORAL_MAX * 0.8);

    expect(wide.viewLabelMin).not.toBe(narrow.viewLabelMin);
    expect(wide.viewMaxSeconds - wide.viewMinSeconds).toBeGreaterThan(
      narrow.viewMaxSeconds - narrow.viewMinSeconds,
    );
  });
});
