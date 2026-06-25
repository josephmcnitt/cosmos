import { describe, expect, it } from 'vitest';
import { TEMPORAL_MAX, UNIVERSE_AGE_SECONDS, simTimeFromLogYearsAgo } from './TimeSpace';
import {
  computeEffectiveTimeWindow,
  eventBelongsToSpatialBand,
  isHumanSpatialBand,
  isInHumanEra,
  normalizedFromSimTimeWindow,
  recomputeTimeViewBounds,
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
    const playhead = UNIVERSE_AGE_SECONDS * 0.55;
    const mid = computeEffectiveTimeWindow(25, playhead, TEMPORAL_MAX / 2);
    const high = computeEffectiveTimeWindow(25, playhead, TEMPORAL_MAX * 0.75);
    const midSpan = Math.abs(mid.viewMinLog - mid.viewMaxLog);
    const highSpan = Math.abs(high.viewMinLog - high.viewMaxLog);
    expect(highSpan).toBeLessThanOrEqual(midSpan);
  });

  it('keeps window edges stable when simTime moves inside stored bounds', () => {
    const temporal = TEMPORAL_MAX / 2;
    const bounds = recomputeTimeViewBounds(25, 100, temporal)!;
    const opts = { viewMinLog: bounds.viewMinLog, viewMaxLog: bounds.viewMaxLog };
    const early = computeEffectiveTimeWindow(25, 100, temporal, opts);
    const later = computeEffectiveTimeWindow(25, 500, temporal, opts);
    expect(later.viewMinLog).toBeCloseTo(early.viewMinLog, 5);
    expect(later.viewMaxLog).toBeCloseTo(early.viewMaxLog, 5);
  });

  it('keeps playhead at the right edge when zooming in further', () => {
    const playhead = UNIVERSE_AGE_SECONDS * 0.65;
    const mid = computeEffectiveTimeWindow(25, playhead, TEMPORAL_MAX * 0.5);
    const edgePlayhead = mid.viewMaxSeconds;
    const priorAtRightEdge = computeEffectiveTimeWindow(25, edgePlayhead, TEMPORAL_MAX * 0.5, {
      viewMinLog: mid.viewMinLog,
      viewMaxLog: mid.viewMaxLog,
    });

    const narrowBounds = recomputeTimeViewBounds(
      25,
      edgePlayhead,
      TEMPORAL_MAX * 0.85,
      priorAtRightEdge,
    );
    expect(narrowBounds).not.toBeNull();
    const narrowSpan = Math.abs(narrowBounds!.viewMinLog - narrowBounds!.viewMaxLog);
    const midSpan = Math.abs(mid.viewMinLog - mid.viewMaxLog);
    expect(narrowSpan).toBeLessThan(midSpan);
    expect(normalizedFromSimTimeWindow(edgePlayhead, {
      ...mid,
      viewMinLog: narrowBounds!.viewMinLog,
      viewMaxLog: narrowBounds!.viewMaxLog,
      viewMinSeconds: simTimeFromLogYearsAgo(narrowBounds!.viewMinLog),
      viewMaxSeconds: edgePlayhead,
    })).toBeGreaterThan(0.85);
  });
});
