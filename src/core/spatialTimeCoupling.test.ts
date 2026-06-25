import { describe, expect, it } from 'vitest';
import { UNIVERSE_AGE_SECONDS } from './TimeSpace';
import {
  eventBelongsToSpatialBand,
  isHumanSpatialBand,
  isInHumanEra,
  computeEffectiveTimeWindow,
} from './spatialTimeCoupling';
import { TEMPORAL_MAX, UNIVERSE_AGE_SECONDS } from './TimeSpace';

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
});
