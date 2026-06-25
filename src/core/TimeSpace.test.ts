import { describe, expect, it } from 'vitest';
import { TEMPORAL_MAX, formatPlayheadTime, formatSimTimeWindowEdge, formatTimelineHeader, UNIVERSE_AGE_SECONDS, yearsAgoLogSpan } from './TimeSpace';
import {
  computeEffectiveTimeWindow,
  simTimeFromWindowNormalized,
} from './spatialTimeCoupling';

describe('formatSimTimeWindowEdge', () => {
  it('uses distinct labels for a zoomed window at the Big Bang', () => {
    const window = computeEffectiveTimeWindow(25, 1, TEMPORAL_MAX);
    const span = yearsAgoLogSpan(window.viewMinSeconds, window.viewMaxSeconds);
    const bandSpan = yearsAgoLogSpan(window.minSeconds, window.maxSeconds);
    const minLabel = formatSimTimeWindowEdge(window.viewMinSeconds, span, bandSpan);
    const maxLabel = formatSimTimeWindowEdge(window.viewMaxSeconds, span, bandSpan);
    expect(minLabel).not.toBe(maxLabel);
    expect(minLabel).not.toBe('13.8 Gya');
  });

  it('uses distinct labels at halfway time zoom near the Big Bang', () => {
    const halfZoom = TEMPORAL_MAX / 2;
    const window = computeEffectiveTimeWindow(25, 1, halfZoom);
    const span = yearsAgoLogSpan(window.viewMinSeconds, window.viewMaxSeconds);
    const bandSpan = yearsAgoLogSpan(window.minSeconds, window.maxSeconds);
    const minLabel = formatSimTimeWindowEdge(window.viewMinSeconds, span, bandSpan);
    const maxLabel = formatSimTimeWindowEdge(window.viewMaxSeconds, span, bandSpan);
    expect(minLabel).not.toBe(maxLabel);
    expect(minLabel).not.toBe('13.8 Gya');
    expect(maxLabel).not.toBe('13.8 Gya');
  });

  it('uses absolute labels on wide deep-time scrubber edges', () => {
    const window = computeEffectiveTimeWindow(25, 1, 0);
    const span = yearsAgoLogSpan(window.viewMinSeconds, window.viewMaxSeconds);
    const bandSpan = yearsAgoLogSpan(window.minSeconds, window.maxSeconds);
    const minLabel = formatSimTimeWindowEdge(window.viewMinSeconds, span, bandSpan);
    expect(minLabel).toMatch(/s|yr|Ma|Ga|Gya/);
  });

  it('playhead labels differ across log-scale scrub positions in deep time', () => {
    const wide = computeEffectiveTimeWindow(25, 0.001, 0);
    const span = wide.viewMaxLog - wide.viewMinLog;
    const atStart = formatPlayheadTime(0.001, span, false);
    const midSeconds = simTimeFromWindowNormalized(0.75, wide);
    const atMid = formatPlayheadTime(midSeconds, span, false);
    expect(atMid).not.toBe(atStart);
  });

  it('timeline header changes when time zoom narrows', () => {
    const playhead = UNIVERSE_AGE_SECONDS * 0.55;
    const wide = computeEffectiveTimeWindow(25, playhead, 0);
    const narrow = computeEffectiveTimeWindow(25, playhead, TEMPORAL_MAX / 2);
    const wideSpan = yearsAgoLogSpan(wide.viewMinSeconds, wide.viewMaxSeconds);
    const narrowSpan = yearsAgoLogSpan(narrow.viewMinSeconds, narrow.viewMaxSeconds);
    const wideBand = yearsAgoLogSpan(wide.minSeconds, wide.maxSeconds);
    const narrowBand = yearsAgoLogSpan(narrow.minSeconds, narrow.maxSeconds);

    const wideHeader = formatTimelineHeader(
      wide.viewMinSeconds,
      wide.viewMaxSeconds,
      wideSpan,
      wideBand,
    );
    const narrowHeader = formatTimelineHeader(
      narrow.viewMinSeconds,
      narrow.viewMaxSeconds,
      narrowSpan,
      narrowBand,
    );
    expect(narrowHeader).not.toBe(wideHeader);
  });
});
