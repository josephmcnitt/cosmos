import { getSpatialBand } from './ScaleSpace';
import { HISTORY_EVENTS } from '../data/history/index';
import { yearsAgo } from '../data/history/time';
import type { HistoryDomain, HistoryEvent } from '../data/history/types';
import {
  clampSimTime,
  formatSimTimeShort,
  TEMPORAL_MAX,
  UNIVERSE_AGE_SECONDS,
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

/**
 * Effective log-scrub window: spatial band bounds narrowed by temporal zoom
 * (temporalExponent 0 = full band, higher = zoom in on sim time).
 */
export function computeEffectiveTimeWindow(
  spatialExponent: number,
  simTimeSeconds: number,
  temporalExponent: number,
): EffectiveTimeWindow {
  const bandWindow = computeSpatialTimeWindow(spatialExponent);
  const bandSpan = bandWindow.maxLog - bandWindow.minLog;
  const zoom = Math.max(0, Math.min(1, temporalExponent / TEMPORAL_MAX));
  const viewSpan = Math.max(
    MIN_VIEW_LOG_SPAN,
    bandSpan * Math.pow(1 - zoom, 1.4),
  );

  const centerLog = Math.max(
    bandWindow.minLog,
    Math.min(bandWindow.maxLog, Math.log10(Math.max(simTimeSeconds, 1))),
  );

  let viewMinLog = centerLog - viewSpan / 2;
  let viewMaxLog = centerLog + viewSpan / 2;

  if (viewMaxLog - viewMinLog >= bandSpan) {
    viewMinLog = bandWindow.minLog;
    viewMaxLog = bandWindow.maxLog;
  } else {
    if (viewMinLog < bandWindow.minLog) {
      viewMaxLog += bandWindow.minLog - viewMinLog;
      viewMinLog = bandWindow.minLog;
    }
    if (viewMaxLog > bandWindow.maxLog) {
      viewMinLog -= viewMaxLog - bandWindow.maxLog;
      viewMaxLog = bandWindow.maxLog;
    }
    viewMinLog = Math.max(bandWindow.minLog, viewMinLog);
    viewMaxLog = Math.min(bandWindow.maxLog, viewMaxLog);
  }

  return {
    ...bandWindow,
    viewMinLog,
    viewMaxLog,
    viewMinSeconds: clampSimTime(Math.pow(10, viewMinLog)),
    viewMaxSeconds: clampSimTime(Math.pow(10, viewMaxLog)),
  };
}

/** Map scrubber [0,1] → sim time (log-linear within effective window). */
export function simTimeFromWindowNormalized(
  normalized: number,
  window: EffectiveTimeWindow,
): number {
  const t = Math.max(0, Math.min(1, normalized));
  const logTime = window.viewMinLog + t * (window.viewMaxLog - window.viewMinLog);
  return clampSimTime(Math.pow(10, logTime));
}

/** Map sim time → scrubber [0,1] (log-linear within effective window). */
export function normalizedFromSimTimeWindow(
  simTimeSeconds: number,
  window: EffectiveTimeWindow,
): number {
  const logTime = Math.log10(Math.max(simTimeSeconds, 1));
  const span = window.viewMaxLog - window.viewMinLog;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(1, (logTime - window.viewMinLog) / span));
}

/** Position an event tick on the scrubber for the current effective window. */
export function tickPositionInWindow(
  simTimeSeconds: number,
  window: EffectiveTimeWindow,
): number | null {
  const logTime = Math.log10(Math.max(simTimeSeconds, 1));
  if (logTime < window.viewMinLog - 0.01 || logTime > window.viewMaxLog + 0.01) {
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
