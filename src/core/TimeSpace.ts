import { ScaleBand } from './ScaleSpace';

/** Age of the universe in seconds (~13.8 billion years). */
export const UNIVERSE_AGE_SECONDS = 13.8e9 * 365.25 * 24 * 3600;

export const TEMPORAL_BANDS: ScaleBand[] = [
  { id: 'cosmic', label: 'Cosmic', minExponent: 0, maxExponent: 15 },
  { id: 'stellar', label: 'Stellar', minExponent: 15, maxExponent: 17 },
  { id: 'geologic', label: 'Geologic', minExponent: 17, maxExponent: 18 },
  { id: 'biological', label: 'Biological', minExponent: 18, maxExponent: 18.3 },
  { id: 'human', label: 'Human', minExponent: 18.3, maxExponent: 18.5 },
];

export const TEMPORAL_MIN = 0;
export const TEMPORAL_MAX = Math.log10(UNIVERSE_AGE_SECONDS);

/** View window half-width in log10 seconds at a given temporal zoom exponent. */
export function temporalWindowHalfWidth(temporalExponent: number): number {
  // Lower zoom = wider window. At ~8, scrub most of cosmic history.
  return Math.pow(10, 1.6 - temporalExponent * 0.12);
}

/** Full-range log scrub: 0 = near Big Bang, 1 = present. */
export function simTimeFromNormalizedFull(normalized: number): number {
  const t = Math.max(0, Math.min(1, normalized));
  const logTime = t * TEMPORAL_MAX;
  return clampSimTime(Math.pow(10, logTime));
}

/** Map sim time to full-range scrubber [0, 1]. */
export function normalizedFromSimTimeFull(simTimeSeconds: number): number {
  const logTime = Math.log10(Math.max(simTimeSeconds, 1));
  return Math.max(0, Math.min(1, logTime / TEMPORAL_MAX));
}

/** Precision scrub around current time when temporal zoom is high. */
export function simTimeFromNormalized(
  normalized: number,
  temporalExponent: number,
  anchorSimTime?: number,
): number {
  if (temporalExponent <= 9) {
    return simTimeFromNormalizedFull(normalized);
  }

  const t = Math.max(0, Math.min(1, normalized));
  const anchorLog = Math.log10(Math.max(anchorSimTime ?? Math.pow(10, temporalExponent), 1));
  const halfWidth = temporalWindowHalfWidth(temporalExponent);
  const minLog = Math.max(0, anchorLog - halfWidth);
  const maxLog = Math.min(TEMPORAL_MAX, anchorLog + halfWidth);
  const logTime = minLog + t * (maxLog - minLog);
  return clampSimTime(Math.pow(10, logTime));
}

/** Map sim time to normalized [0,1] for scrubber position. */
export function normalizedFromSimTime(
  simTimeSeconds: number,
  temporalExponent: number,
  anchorSimTime?: number,
): number {
  if (temporalExponent <= 9) {
    return normalizedFromSimTimeFull(simTimeSeconds);
  }

  const logTime = Math.log10(Math.max(simTimeSeconds, 1));
  const anchorLog = Math.log10(Math.max(anchorSimTime ?? simTimeSeconds, 1));
  const halfWidth = temporalWindowHalfWidth(temporalExponent);
  const minLog = Math.max(0, anchorLog - halfWidth);
  const maxLog = Math.min(TEMPORAL_MAX, anchorLog + halfWidth);
  if (maxLog <= minLog) return 0;
  return Math.max(0, Math.min(1, (logTime - minLog) / (maxLog - minLog)));
}

export function clampTemporalExponent(exponent: number): number {
  return Math.max(TEMPORAL_MIN, Math.min(TEMPORAL_MAX, exponent));
}

export function clampSimTime(seconds: number): number {
  return Math.max(0, Math.min(UNIVERSE_AGE_SECONDS, seconds));
}

export function getTemporalBand(simTimeSeconds: number): ScaleBand {
  const logTime = Math.log10(Math.max(simTimeSeconds, 1));
  for (const band of TEMPORAL_BANDS) {
    if (logTime >= band.minExponent && logTime < band.maxExponent) {
      return band;
    }
  }
  if (logTime >= TEMPORAL_BANDS[TEMPORAL_BANDS.length - 1]!.minExponent) {
    return TEMPORAL_BANDS[TEMPORAL_BANDS.length - 1]!;
  }
  return TEMPORAL_BANDS[0]!;
}

const YEAR_SECONDS = 365.25 * 24 * 3600;
const GYA = 1e9 * YEAR_SECONDS;
const MYA = 1e6 * YEAR_SECONDS;

/** Format sim time as human-readable epoch label. */
export function formatSimTime(simTimeSeconds: number): string {
  const age = UNIVERSE_AGE_SECONDS - simTimeSeconds;
  const yearsAgo = age / YEAR_SECONDS;

  if (yearsAgo >= 1e9) {
    return `${(yearsAgo / 1e9).toFixed(2)} Gya ago`;
  }
  if (yearsAgo >= 1e6) {
    return `${(yearsAgo / 1e6).toFixed(2)} Mya ago`;
  }
  if (yearsAgo >= 1e4) {
    return `${Math.round(yearsAgo / 1e3)} kya ago`;
  }
  if (yearsAgo >= 1) {
    const ce = new Date().getFullYear() - Math.round(yearsAgo);
    if (ce >= 1 && ce <= 9999) return `${ce} CE`;
    return `${Math.round(yearsAgo)} years ago`;
  }
  if (simTimeSeconds < 1e6) {
    return `${(simTimeSeconds / 1e3).toFixed(1)} ksec after Big Bang`;
  }
  if (simTimeSeconds < GYA) {
    return `${(simTimeSeconds / 1e6 / YEAR_SECONDS).toFixed(1)} My after Big Bang`;
  }
  return `${(simTimeSeconds / GYA).toFixed(2)} Ga after Big Bang`;
}

export function formatSimTimeShort(simTimeSeconds: number): string {
  const age = UNIVERSE_AGE_SECONDS - simTimeSeconds;
  const yearsAgo = age / YEAR_SECONDS;
  if (yearsAgo < 100) return 'Present';
  if (yearsAgo >= 1e9) return `${(yearsAgo / 1e9).toFixed(1)} Gya`;
  if (yearsAgo >= 1e6) return `${(yearsAgo / 1e6).toFixed(0)} Mya`;
  if (yearsAgo >= 1e3) return `${(yearsAgo / 1e3).toFixed(0)} kya`;
  const ce = new Date().getFullYear() - Math.round(yearsAgo);
  return `${ce} CE`;
}

/** Absolute time since Big Bang — used for narrowed timeline windows. */
export function formatSimTimeAbsoluteShort(
  simTimeSeconds: number,
  viewLogSpan: number,
): string {
  if (simTimeSeconds >= UNIVERSE_AGE_SECONDS - YEAR_SECONDS * 100) return 'Present';
  if (simTimeSeconds < 1) {
    return `${Math.max(simTimeSeconds, 1e-30).toExponential(1)} s`;
  }
  if (simTimeSeconds < YEAR_SECONDS) return `${simTimeSeconds.toFixed(1)} s`;
  if (simTimeSeconds < MYA) return `${(simTimeSeconds / YEAR_SECONDS).toFixed(1)} yr`;
  if (simTimeSeconds < GYA) return `${(simTimeSeconds / MYA).toFixed(2)} Ma`;
  const ga = simTimeSeconds / GYA;
  const decimals = viewLogSpan < 0.15 ? 3 : viewLogSpan < 0.6 ? 2 : 1;
  return `${ga.toFixed(decimals)} Ga`;
}

/** Scrubber endpoint label — adapts precision/units to the visible log-time span. */
export function formatSimTimeWindowEdge(
  simTimeSeconds: number,
  viewLogSpan: number,
  bandLogSpan: number,
): string {
  const narrowed = viewLogSpan < bandLogSpan * 0.95;
  if (narrowed) {
    return formatSimTimeAbsoluteShort(simTimeSeconds, viewLogSpan);
  }
  return formatSimTimeShort(simTimeSeconds);
}

/** Human-readable timeline header from visible window edges. */
export function formatTimelineHeader(
  viewMinSeconds: number,
  viewMaxSeconds: number,
  viewLogSpan: number,
  bandLogSpan: number,
): string {
  const minLabel = formatSimTimeWindowEdge(viewMinSeconds, viewLogSpan, bandLogSpan);
  const maxLabel = formatSimTimeWindowEdge(viewMaxSeconds, viewLogSpan, bandLogSpan);
  return `${minLabel} – ${maxLabel}`;
}

/** Seconds of sim time advanced per real second at playback rate 1×. */
export const BASE_TIME_SCALE = MYA;

export function advanceSimTime(
  simTimeSeconds: number,
  deltaRealSeconds: number,
  playbackRate: number,
): number {
  if (playbackRate === 0) return simTimeSeconds;
  const delta = deltaRealSeconds * playbackRate * BASE_TIME_SCALE;
  return clampSimTime(simTimeSeconds + delta);
}
