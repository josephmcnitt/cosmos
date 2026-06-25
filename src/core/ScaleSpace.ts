export interface ScaleBand {
  id: string;
  label: string;
  minExponent: number;
  maxExponent: number;
}

/** Contiguous bands — no gaps, so labels and LOD never fall through to Human. */
export const SPATIAL_BANDS: ScaleBand[] = [
  { id: 'universe', label: 'Universe', minExponent: 24, maxExponent: 26 },
  { id: 'galaxy', label: 'Galaxy', minExponent: 20, maxExponent: 24 },
  { id: 'stellar', label: 'Stellar', minExponent: 16, maxExponent: 20 },
  { id: 'planetary', label: 'Planetary', minExponent: 12, maxExponent: 16 },
  { id: 'terrestrial', label: 'Terrestrial', minExponent: 6, maxExponent: 12 },
  { id: 'human', label: 'Human', minExponent: -2, maxExponent: 6 },
];

export const SPATIAL_MIN = -2;
export const SPATIAL_MAX = 26;

const FADE_WIDTH = 0.85;

export function clampSpatialExponent(exponent: number): number {
  return Math.max(SPATIAL_MIN, Math.min(SPATIAL_MAX, exponent));
}

export function metersFromExponent(exponent: number): number {
  return Math.pow(10, exponent);
}

/** Map log-scale exponent to camera distance in scene units (not literal meters). */
export function sceneDistanceFromExponent(exponent: number): number {
  const clamped = clampSpatialExponent(exponent);
  return Math.max(3, Math.min(220, 3 + (clamped - SPATIAL_MIN) * 7.5));
}

export function exponentFromMeters(meters: number): number {
  return Math.log10(Math.max(meters, 1e-6));
}

export function getSpatialBand(exponent: number): ScaleBand {
  const clamped = clampSpatialExponent(exponent);
  for (const band of SPATIAL_BANDS) {
    if (clamped >= band.minExponent && clamped < band.maxExponent) {
      return band;
    }
  }
  return clamped >= SPATIAL_BANDS[0]!.minExponent
    ? SPATIAL_BANDS[0]!
    : SPATIAL_BANDS[SPATIAL_BANDS.length - 1]!;
}

/** Opacity for cross-fade — only non-zero inside band (+ narrow edge fade). */
export function getBandOpacity(band: ScaleBand, exponent: number): number {
  const exp = clampSpatialExponent(exponent);
  const innerMin = band.minExponent + FADE_WIDTH * 0.5;
  const innerMax = band.maxExponent - FADE_WIDTH * 0.5;

  if (exp < band.minExponent - FADE_WIDTH || exp > band.maxExponent + FADE_WIDTH) {
    return 0;
  }
  if (exp >= innerMin && exp <= innerMax) {
    return 1;
  }
  if (exp < innerMin) {
    return (exp - (band.minExponent - FADE_WIDTH)) / (innerMin - (band.minExponent - FADE_WIDTH));
  }
  return (band.maxExponent + FADE_WIDTH - exp) / (band.maxExponent + FADE_WIDTH - innerMax);
}

export function getDominantSpatialBand(exponent: number): ScaleBand {
  return getSpatialBand(exponent);
}
