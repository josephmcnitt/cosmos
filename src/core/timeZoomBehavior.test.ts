import { beforeEach, describe, expect, it } from 'vitest';
import { getInitialObserverState, useObserverStore } from './ObserverState';
import {
  computeEffectiveTimeWindow,
  computeViewLogSpan,
  isEffectiveWindowNarrowed,
  normalizedFromSimTimeWindow,
  storedTimeWindowOptions,
} from './spatialTimeCoupling';
import { TEMPORAL_MAX } from './TimeSpace';

const SPATIAL = 25;
const PLAYHEAD = 1197;

function resetStore(overrides: Partial<ReturnType<typeof getInitialObserverState>> = {}) {
  useObserverStore.setState({ ...getInitialObserverState(), ...overrides });
}

function storeWindow() {
  const s = useObserverStore.getState();
  return computeEffectiveTimeWindow(
    s.spatialExponent,
    s.simTimeSeconds,
    s.temporalExponent,
    storedTimeWindowOptions(s.timeViewMinLog, s.timeViewMaxLog),
  );
}

function playheadFraction() {
  const s = useObserverStore.getState();
  return normalizedFromSimTimeWindow(s.simTimeSeconds, storeWindow());
}

function setZoom(temporal: number) {
  useObserverStore.getState().setTemporalExponent(temporal);
}

function scrubTo(normalized: number) {
  const s = useObserverStore.getState();
  s.scrubNormalized(normalized, s.simTimeSeconds);
}

describe('time zoom behavior (observer store)', () => {
  beforeEach(() => {
    resetStore({
      spatialExponent: SPATIAL,
      simTimeSeconds: PLAYHEAD,
      temporalExponent: 0,
      timeViewMinLog: null,
      timeViewMaxLog: null,
    });
  });

  it('narrows min/max span when time zoom increases', () => {
    const wide = storeWindow();
    setZoom(TEMPORAL_MAX * 0.55);
    const narrow = storeWindow();

    expect(isEffectiveWindowNarrowed(narrow)).toBe(true);
    expect(narrow.viewMaxSeconds - narrow.viewMinSeconds).toBeLessThan(
      wide.viewMaxSeconds - wide.viewMinSeconds,
    );
    expect(narrow.viewMinSeconds).toBeLessThan(PLAYHEAD);
    expect(narrow.viewMaxSeconds).toBeGreaterThan(PLAYHEAD);
  });

  it('keeps playhead inside [min, max] after zoom', () => {
    setZoom(TEMPORAL_MAX * 0.6);
    const w = storeWindow();
    expect(w.viewMinSeconds).toBeLessThanOrEqual(PLAYHEAD);
    expect(w.viewMaxSeconds).toBeGreaterThanOrEqual(PLAYHEAD);
  });

  it('scrubbing changes playhead but not window edges when zoomed in', () => {
    setZoom(TEMPORAL_MAX * 0.6);
    const before = storeWindow();
    const minBefore = before.viewMinSeconds;
    const maxBefore = before.viewMaxSeconds;

    scrubTo(0.15);
    const afterLow = storeWindow();
    const lowTime = useObserverStore.getState().simTimeSeconds;
    expect(afterLow.viewMinSeconds).toBeCloseTo(minBefore, -6);
    expect(afterLow.viewMaxSeconds).toBeCloseTo(maxBefore, -6);
    expect(lowTime).toBeLessThan(PLAYHEAD);

    scrubTo(0.9);
    const afterHigh = storeWindow();
    const highTime = useObserverStore.getState().simTimeSeconds;
    expect(afterHigh.viewMinSeconds).toBeCloseTo(minBefore, -6);
    expect(afterHigh.viewMaxSeconds).toBeCloseTo(maxBefore, -6);
    expect(highTime).toBeGreaterThan(lowTime);
  });

  it('clicking earlier on timeline yields lower sim time than clicking later', () => {
    setZoom(TEMPORAL_MAX * 0.65);
    scrubTo(0.1);
    const low = useObserverStore.getState().simTimeSeconds;
    scrubTo(0.85);
    const high = useObserverStore.getState().simTimeSeconds;
    expect(high).toBeGreaterThan(low);
  });

  it('zooms in around playhead at the right edge (max stays on playhead)', () => {
    setZoom(TEMPORAL_MAX * 0.5);
    scrubTo(1);
    const playhead = useObserverStore.getState().simTimeSeconds;
    const mid = storeWindow();
    const maxBefore = mid.viewMaxSeconds;

    setZoom(TEMPORAL_MAX * 0.82);
    const tight = storeWindow();

    expect(tight.viewMaxSeconds).toBeCloseTo(maxBefore, -4);
    expect(tight.viewMaxSeconds).toBeCloseTo(playhead, -4);
    expect(tight.viewMinSeconds).toBeGreaterThan(mid.viewMinSeconds);
    expect(tight.viewMaxSeconds - tight.viewMinSeconds).toBeLessThan(
      mid.viewMaxSeconds - mid.viewMinSeconds,
    );
  });

  it('zooms in around current playhead fraction (left edge stays fixed)', () => {
    setZoom(TEMPORAL_MAX * 0.5);
    scrubTo(0.05);
    const playhead = useObserverStore.getState().simTimeSeconds;
    const mid = storeWindow();
    const minBefore = mid.viewMinSeconds;

    setZoom(TEMPORAL_MAX * 0.82);
    const tight = storeWindow();

    expect(tight.viewMinSeconds).toBeCloseTo(minBefore, -5);
    expect(tight.viewMinSeconds).toBeLessThanOrEqual(playhead * 1.01);
    expect(tight.viewMaxSeconds).toBeLessThan(mid.viewMaxSeconds);
  });

  it('stored bounds span matches temporal zoom level', () => {
    setZoom(TEMPORAL_MAX * 0.7);
    const s = useObserverStore.getState();
    expect(s.timeViewMinLog).not.toBeNull();
    expect(s.timeViewMaxLog).not.toBeNull();
    const expectedSpan = computeViewLogSpan(s.spatialExponent, s.temporalExponent);
    const storedSpan = s.timeViewMaxLog! - s.timeViewMinLog!;
    expect(storedSpan).toBeCloseTo(expectedSpan, 5);
  });

  it('widening time zoom expands min/max span', () => {
    setZoom(TEMPORAL_MAX * 0.75);
    const narrow = storeWindow();
    setZoom(TEMPORAL_MAX * 0.35);
    const wider = storeWindow();
    expect(wider.viewMaxSeconds - wider.viewMinSeconds).toBeGreaterThan(
      narrow.viewMaxSeconds - narrow.viewMinSeconds,
    );
  });

  it('playhead fraction is preserved across sequential zoom-in steps', () => {
    setZoom(TEMPORAL_MAX * 0.45);
    scrubTo(0.72);
    const fractionBefore = playheadFraction();

    setZoom(TEMPORAL_MAX * 0.62);
    const fractionMid = playheadFraction();
    expect(fractionMid).toBeCloseTo(fractionBefore, 2);

    setZoom(TEMPORAL_MAX * 0.78);
    const fractionTight = playheadFraction();
    expect(fractionTight).toBeCloseTo(fractionBefore, 2);
  });
});
