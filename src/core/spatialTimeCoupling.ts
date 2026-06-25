import { getSpatialBand } from './ScaleSpace';
import { HISTORY_EVENTS } from '../data/history/index';
import { yearsAgo } from '../data/history/time';
import type { HistoryDomain, HistoryEvent } from '../data/history/types';
import {
  clampSimTime,
  formatSimTimeShort,
  logYearsAgoFromSimTime,
  simTimeFromLogYearsAgo,
  TEMPORAL_MAX,
  UNIVERSE_AGE_SECONDS,
  yearsAgoLogSpan,
} from './TimeSpace';

const LOG_PAD = 0.12;
const MIN_VIEW_LOG_SPAN = 0.06;

/** Earliest human-history anchor (agriculture ~12 kya). */
export const HUMAN_ERA_MIN_SECONDS = yearsAgo(12_000);
export const HUMAN_ERA_MAX_SECONDS = UNIVERSE_AGE_SECONDS;

export interface SpatialTimeWindow {
  bandId: string;
  minLog: number;
  maxLog: number;
  minSeconds: number;
  maxSeconds: number;
  labelMin: string;
  labelMax: string;
}

export interface EffectiveTimeWindow extends SpatialTimeWindow {
  viewMinLog: number;
  viewMaxLog: number;
  viewMinSeconds: number;
  viewMaxSeconds: number;
}

const DOMAIN_DEFAULT_BAND: Record<HistoryDomain, string> = {
  cosmic: 'galaxy',
  geologic: 'planetary',
  biologic: 'terrestrial',
  human: 'human',
};

export function eventSpatialBandId(event: {
  spatialBand?: string;
  domain?: HistoryDomain;
}): string {
  if (event.spatialBand) return event.spatialBand;
  if (event.domain) return DOMAIN_DEFAULT_BAND[event.domain];
  return 'universe';
}

/** Strict band match — no cross-band bleed from exponent slack. */
export function eventBelongsToSpatialBand(
  event: { spatialBand?: string; domain?: HistoryDomain },
  bandId: string,
): boolean {
  return eventSpatialBandId(event) === bandId;
}

export function isInHumanEra(simTimeSeconds: number): boolean {
  return simTimeSeconds >= HUMAN_ERA_MIN_SECONDS;
}

export function isHumanSpatialBand(spatialExponent: number): boolean {
  return getSpatialBand(spatialExponent).id === 'human';
}

/** Events whose spatial band matches exactly (for ticks and time windows). */
export function getEventsForSpatialBand(bandId: string): HistoryEvent[] {
  return HISTORY_EVENTS.filter((event) => eventBelongsToSpatialBand(event, bandId));
}

/** Log-time bounds for a spatial band, derived from matching history events. */
export function computeSpatialTimeWindow(spatialExponent: number): SpatialTimeWindow {
  const band = getSpatialBand(spatialExponent);
  const events = getEventsForSpatialBand(band.id);

  let minSeconds = 0;
  let maxSeconds = UNIVERSE_AGE_SECONDS;

  if (events.length > 0) {
    minSeconds = events[0]!.simTimeSeconds;
    maxSeconds = events[events.length - 1]!.simTimeSeconds;
  }

  if (band.id === 'universe' || band.id === 'galaxy') {
    minSeconds = 0;
    maxSeconds = UNIVERSE_AGE_SECONDS;
  }

  if (band.id === 'human') {
    minSeconds = HUMAN_ERA_MIN_SECONDS;
    maxSeconds = HUMAN_ERA_MAX_SECONDS;
  }

  const minLog = Math.log10(Math.max(minSeconds, 1)) - LOG_PAD;
  const maxLog = Math.log10(Math.max(maxSeconds, 1)) + LOG_PAD;

  const clampedMinLog = Math.max(0, minLog);
  const clampedMaxLog = Math.min(
    Math.log10(UNIVERSE_AGE_SECONDS),
    Math.max(clampedMinLog + MIN_VIEW_LOG_SPAN, maxLog),
  );

  const minSec = clampSimTime(Math.pow(10, clampedMinLog));
  const maxSec = clampSimTime(Math.pow(10, clampedMaxLog));

  return {
    bandId: band.id,
    minLog: clampedMinLog,
    maxLog: clampedMaxLog,
    minSeconds: minSec,
    maxSeconds: maxSec,
    labelMin: formatSimTimeShort(minSec),
    labelMax: formatSimTimeShort(maxSec),
  };
}

export interface TimeWindowOptions {
  /** When narrowed, use these fixed log bounds (scrub/pan). */
  viewMinLog?: number | null;
  viewMaxLog?: number | null;
}

export function storedTimeWindowOptions(
  timeViewMinLog: number | null,
  timeViewMaxLog: number | null,
): TimeWindowOptions | undefined {
  if (timeViewMinLog != null && timeViewMaxLog != null) {
    return { viewMinLog: timeViewMinLog, viewMaxLog: timeViewMaxLog };
  }
  return undefined;
}

function layoutTimeViewBounds(
  playheadSeconds: number,
  fraction: number,
  viewSpanAgo: number,
  bandWindow: Pick<SpatialTimeWindow, 'minSeconds' | 'maxSeconds'>,
): { viewMinLog: number; viewMaxLog: number } {
  const f = Math.max(0, Math.min(1, fraction));
  const playheadAgo = logYearsAgoFromSimTime(playheadSeconds);
  let logAgoHigh = playheadAgo + f * viewSpanAgo;
  let logAgoLow = logAgoHigh - viewSpanAgo;

  const bandAgoHigh = logYearsAgoFromSimTime(bandWindow.minSeconds);
  const bandAgoLow = logYearsAgoFromSimTime(bandWindow.maxSeconds);

  if (logAgoHigh > bandAgoHigh) {
    const shift = logAgoHigh - bandAgoHigh;
    logAgoHigh -= shift;
    logAgoLow -= shift;
  }
  if (logAgoLow < bandAgoLow) {
    const shift = bandAgoLow - logAgoLow;
    logAgoHigh += shift;
    logAgoLow += shift;
  }

  logAgoHigh = Math.min(logAgoHigh, bandAgoHigh);
  logAgoLow = Math.max(logAgoLow, bandAgoLow);

  const viewMinSeconds =
    f <= 1e-12 ? playheadSeconds : simTimeFromLogYearsAgo(logAgoHigh);
  const viewMaxSeconds =
    f >= 1 - 1e-12 ? playheadSeconds : simTimeFromLogYearsAgo(logAgoLow);

  return {
    viewMinLog: logYearsAgoFromSimTime(viewMinSeconds),
    viewMaxLog: logYearsAgoFromSimTime(viewMaxSeconds),
  };
}

function secondsFromAgoLogs(viewMinAgoLog: number, viewMaxAgoLog: number): {
  viewMinSeconds: number;
  viewMaxSeconds: number;
} {
  let bbAgoLog = viewMinAgoLog;
  let presentAgoLog = viewMaxAgoLog;
  if (bbAgoLog < presentAgoLog) {
    [bbAgoLog, presentAgoLog] = [presentAgoLog, bbAgoLog];
  }
  const viewMinSeconds = simTimeFromLogYearsAgo(bbAgoLog);
  const viewMaxSeconds = simTimeFromLogYearsAgo(presentAgoLog);
  return {
    viewMinSeconds: Math.min(viewMinSeconds, viewMaxSeconds),
    viewMaxSeconds: Math.max(viewMinSeconds, viewMaxSeconds),
  };
}

export function computeViewLogSpan(
  spatialExponent: number,
  temporalExponent: number,
): number {
  const bandWindow = computeSpatialTimeWindow(spatialExponent);
  const bandSpan = yearsAgoLogSpan(bandWindow.minSeconds, bandWindow.maxSeconds);
  const t = Math.max(0, Math.min(1, temporalExponent / TEMPORAL_MAX));
  const zoom = 1 - Math.pow(1 - t, 2);
  return Math.max(MIN_VIEW_LOG_SPAN, bandSpan * (1 - zoom));
}

/**
 * Effective log-scrub window: spatial band bounds narrowed by temporal zoom
 * (temporalExponent 0 = full band, higher = zoom in on sim time).
 */
export function computeEffectiveTimeWindow(
  spatialExponent: number,
  simTimeSeconds: number,
  temporalExponent: number,
  options?: TimeWindowOptions,
): EffectiveTimeWindow {
  const bandWindow = computeSpatialTimeWindow(spatialExponent);
  const bandSpan = yearsAgoLogSpan(bandWindow.minSeconds, bandWindow.maxSeconds);
  const viewSpan = computeViewLogSpan(spatialExponent, temporalExponent);

  const narrowed = viewSpan < bandSpan * 0.95;

  let viewMinLog: number;
  let viewMaxLog: number;

  if (
    narrowed &&
    options?.viewMinLog != null &&
    options?.viewMaxLog != null
  ) {
    viewMinLog = options.viewMinLog;
    viewMaxLog = options.viewMaxLog;
  } else if (narrowed) {
    const wideWindow = computeEffectiveTimeWindow(
      spatialExponent,
      simTimeSeconds,
      0,
    );
    const fraction = normalizedFromSimTimeWindow(simTimeSeconds, wideWindow);
    ({ viewMinLog, viewMaxLog } = layoutTimeViewBounds(
      simTimeSeconds,
      fraction,
      viewSpan,
      bandWindow,
    ));
  } else {
    ({ viewMinLog, viewMaxLog } = layoutTimeViewBounds(
      simTimeSeconds,
      0.5,
      viewSpan,
      bandWindow,
    ));
  }

  const viewMinSeconds = secondsFromAgoLogs(viewMinLog, viewMaxLog).viewMinSeconds;
  const viewMaxSeconds = secondsFromAgoLogs(viewMinLog, viewMaxLog).viewMaxSeconds;
  const viewAgoSpan = yearsAgoLogSpan(viewMinSeconds, viewMaxSeconds);

  if (!narrowed || options?.viewMinLog == null) {
    if (viewAgoSpan >= bandSpan) {
      viewMinLog = logYearsAgoFromSimTime(bandWindow.minSeconds);
      viewMaxLog = logYearsAgoFromSimTime(bandWindow.maxSeconds);
    } else {
      ({ viewMinLog, viewMaxLog } = layoutTimeViewBounds(
        simTimeSeconds,
        normalizedFromSimTimeWindow(simTimeSeconds, {
          ...bandWindow,
          viewMinLog,
          viewMaxLog,
          viewMinSeconds,
          viewMaxSeconds,
        }),
        viewSpan,
        bandWindow,
      ));
    }
  }

  const resolved = secondsFromAgoLogs(viewMinLog, viewMaxLog);
  return {
    ...bandWindow,
    viewMinLog,
    viewMaxLog,
    viewMinSeconds: resolved.viewMinSeconds,
    viewMaxSeconds: resolved.viewMaxSeconds,
  };
}

function agoLogsFromWindow(window: Pick<EffectiveTimeWindow, 'viewMinSeconds' | 'viewMaxSeconds'>): {
  bbAgoLog: number;
  presentAgoLog: number;
} {
  let bbAgoLog = logYearsAgoFromSimTime(window.viewMinSeconds);
  let presentAgoLog = logYearsAgoFromSimTime(window.viewMaxSeconds);
  if (bbAgoLog < presentAgoLog) {
    [bbAgoLog, presentAgoLog] = [presentAgoLog, bbAgoLog];
  }
  return { bbAgoLog, presentAgoLog };
}

/** Map scrubber [0,1] → sim time (log-linear in years ago within effective window). */
export function simTimeFromWindowNormalized(
  normalized: number,
  window: EffectiveTimeWindow,
): number {
  const t = Math.max(0, Math.min(1, normalized));
  const { bbAgoLog, presentAgoLog } = agoLogsFromWindow(window);
  const logAgo = bbAgoLog + t * (presentAgoLog - bbAgoLog);
  return simTimeFromLogYearsAgo(logAgo);
}

/** Map sim time → scrubber [0,1] (log-linear in years ago within effective window). */
export function normalizedFromSimTimeWindow(
  simTimeSeconds: number,
  window: EffectiveTimeWindow,
): number {
  const { bbAgoLog, presentAgoLog } = agoLogsFromWindow(window);
  const logAgo = logYearsAgoFromSimTime(simTimeSeconds);
  const span = presentAgoLog - bbAgoLog;
  if (span === 0) return 0;
  return Math.max(0, Math.min(1, (logAgo - bbAgoLog) / span));
}

/** Position an event tick on the scrubber for the current effective window. */
export function tickPositionInWindow(
  simTimeSeconds: number,
  window: EffectiveTimeWindow,
): number | null {
  const { bbAgoLog, presentAgoLog } = agoLogsFromWindow(window);
  const logAgo = logYearsAgoFromSimTime(simTimeSeconds);
  if (logAgo > bbAgoLog + 0.01 || logAgo < presentAgoLog - 0.01) {
    return null;
  }
  return normalizedFromSimTimeWindow(simTimeSeconds, window);
}

export function clampSimTimeToSpatialBand(
  simTimeSeconds: number,
  spatialExponent: number,
): number {
  const { minSeconds, maxSeconds } = computeSpatialTimeWindow(spatialExponent);
  return clampSimTime(Math.max(minSeconds, Math.min(maxSeconds, simTimeSeconds)));
}

export function bandLogSpan(window: Pick<SpatialTimeWindow, 'minSeconds' | 'maxSeconds'>): number {
  return yearsAgoLogSpan(window.minSeconds, window.maxSeconds);
}

export function isEffectiveWindowNarrowed(
  window: Pick<EffectiveTimeWindow, 'viewMinSeconds' | 'viewMaxSeconds' | 'minSeconds' | 'maxSeconds'>,
): boolean {
  const viewSpan = yearsAgoLogSpan(window.viewMinSeconds, window.viewMaxSeconds);
  const fullSpan = yearsAgoLogSpan(window.minSeconds, window.maxSeconds);
  return viewSpan < fullSpan * 0.95;
}

/** Log10 years-ago for time-window layout. */
export function playheadLogFromSimTime(simTimeSeconds: number): number {
  return logYearsAgoFromSimTime(simTimeSeconds);
}

/** Recompute narrowed view bounds zooming around the playhead. */
export function recomputeTimeViewBounds(
  spatialExponent: number,
  simTimeSeconds: number,
  temporalExponent: number,
  priorWindow?: Pick<EffectiveTimeWindow, 'viewMinLog' | 'viewMaxLog' | 'minLog' | 'maxLog'>,
): { viewMinLog: number; viewMaxLog: number } | null {
  const bandWindow = computeSpatialTimeWindow(spatialExponent);
  const bandSpan = yearsAgoLogSpan(bandWindow.minSeconds, bandWindow.maxSeconds);
  const viewSpan = computeViewLogSpan(spatialExponent, temporalExponent);
  if (viewSpan >= bandSpan * 0.95) return null;

  let fraction = 0.5;
  if (priorWindow && isEffectiveWindowNarrowed(priorWindow as EffectiveTimeWindow)) {
    fraction = normalizedFromSimTimeWindow(simTimeSeconds, priorWindow as EffectiveTimeWindow);
  } else {
    const wideWindow = computeEffectiveTimeWindow(
      spatialExponent,
      simTimeSeconds,
      0,
    );
    fraction = normalizedFromSimTimeWindow(simTimeSeconds, wideWindow);
  }
  if (fraction < 1e-9) fraction = 0;
  if (fraction > 1 - 1e-9) fraction = 1;

  return layoutTimeViewBounds(simTimeSeconds, fraction, viewSpan, bandWindow);
}

/** Translate stored view bounds for panning, clamped to the spatial band. */
export function translateTimeViewBounds(
  viewMinLog: number,
  viewMaxLog: number,
  deltaLog: number,
  bandWindow: Pick<SpatialTimeWindow, 'minSeconds' | 'maxSeconds'>,
): { viewMinLog: number; viewMaxLog: number } {
  let logAgoHigh = viewMinLog;
  let logAgoLow = viewMaxLog;

  logAgoHigh -= deltaLog;
  logAgoLow -= deltaLog;

  const bandAgoHigh = logYearsAgoFromSimTime(bandWindow.minSeconds);
  const bandAgoLow = logYearsAgoFromSimTime(bandWindow.maxSeconds);

  if (logAgoHigh > bandAgoHigh) {
    const shift = logAgoHigh - bandAgoHigh;
    logAgoHigh -= shift;
    logAgoLow -= shift;
  }
  if (logAgoLow < bandAgoLow) {
    const shift = bandAgoLow - logAgoLow;
    logAgoHigh += shift;
    logAgoLow += shift;
  }

  return {
    viewMinLog: Math.min(logAgoHigh, bandAgoHigh),
    viewMaxLog: Math.max(logAgoLow, bandAgoLow),
  };
}
