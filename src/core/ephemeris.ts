/**
 * Fixed-noon Sun/Moon ephemeris for Athens (Platonic walk site theme).
 * Reference: 2026-06-21 12:00 UTC (summer solstice — high Sun for dramatic sky).
 * Accuracy ~±1–2° — sufficient for geometric billboards.
 */

const DEG = Math.PI / 180;

/** Athens observer — aligns with embodied site markers. */
export const OBSERVER_LAT = 37.9838 * DEG;
export const OBSERVER_LON = 23.7275 * DEG;

/** Fixed reference instant: noon UTC on 2026-06-21. */
export const REFERENCE_DATE = new Date(Date.UTC(2026, 5, 21, 12, 0, 0));

export interface EphemerisSnapshot {
  sunAzimuth: number;
  sunAltitude: number;
  moonAzimuth: number;
  moonAltitude: number;
  moonPhase: number;
}

function julianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const D =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

function normalizeAngle(rad: number): number {
  const tau = Math.PI * 2;
  return ((rad % tau) + tau) % tau;
}

/** Solar declination and ecliptic longitude (radians) for a Julian day. */
function solarEcliptic(jd: number): { declination: number; rightAscension: number } {
  const n = jd - 2451545.0;
  const L = normalizeAngle((280.46 + 0.9856474 * n) * DEG);
  const g = normalizeAngle((357.528 + 0.9856003 * n) * DEG);
  const lambda = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const epsilon = 23.439 * DEG;
  const declination = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  const rightAscension = Math.atan2(
    Math.cos(epsilon) * Math.sin(lambda),
    Math.cos(lambda),
  );
  return { declination, rightAscension };
}

/** Hour angle (radians) at observer for a UTC clock time — east longitude advances solar time. */
function hourAngleFromUtc(utcHours: number): number {
  return (utcHours - 12) * 15 * DEG + OBSERVER_LON;
}

/** Horizontal coordinates from declination and UTC clock (solar geometry MVP). */
function equatorialToHorizontal(
  declination: number,
  utcHours: number,
): { azimuth: number; altitude: number } {
  const hourAngle = hourAngleFromUtc(utcHours);
  const sinAlt =
    Math.sin(OBSERVER_LAT) * Math.sin(declination) +
    Math.cos(OBSERVER_LAT) * Math.cos(declination) * Math.cos(hourAngle);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz =
    (Math.sin(declination) - Math.sin(altitude) * Math.sin(OBSERVER_LAT)) /
    (Math.cos(altitude) * Math.cos(OBSERVER_LAT) + 1e-12);
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(hourAngle) > 0) azimuth = Math.PI * 2 - azimuth;
  return { azimuth, altitude };
}

/** Simplified lunar position and illuminated fraction. */
function lunarSnapshot(jd: number): {
  azimuth: number;
  altitude: number;
  phase: number;
} {
  const n = jd - 2451545.0;
  const Lm = normalizeAngle((218.316 + 13.176396 * n) * DEG);
  const Mm = normalizeAngle((134.963 + 13.064993 * n) * DEG);
  const lambda =
    Lm +
    (6.289 * Math.sin(Mm) + 1.274 * Math.sin(2 * Lm - Mm)) * DEG;
  const beta = (5.128 * Math.sin(Mm + Lm)) * DEG;
  const epsilon = 23.439 * DEG;
  const declination = Math.asin(
    Math.sin(beta) * Math.cos(epsilon) + Math.cos(beta) * Math.sin(epsilon) * Math.sin(lambda),
  );
  const { azimuth, altitude } = equatorialToHorizontal(declination, 12);
  const Ms = normalizeAngle((357.529 + 0.9856003 * n) * DEG);
  const phase = 0.5 * (1 - Math.cos(Ms - Mm));
  return { azimuth, altitude, phase: Math.max(0, Math.min(1, phase)) };
}

export function computeEphemeris(date: Date = REFERENCE_DATE): EphemerisSnapshot {
  const jd = julianDay(date);
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const sun = solarEcliptic(jd);
  const sunHor = equatorialToHorizontal(sun.declination, utcHours);
  const moon = lunarSnapshot(jd);
  return {
    sunAzimuth: sunHor.azimuth,
    sunAltitude: sunHor.altitude,
    moonAzimuth: moon.azimuth,
    moonAltitude: moon.altitude,
    moonPhase: moon.phase,
  };
}

/** Extra ambient when ephemeris band is active — brighter at high noon Sun. */
export function ephemerisDayAmbientBoost(sunAltitude: number): number {
  if (sunAltitude <= 0) return 0;
  return 0.08 * Math.sin(sunAltitude);
}

/** Unit direction on sky sphere from azimuth (from N, clockwise) and altitude. */
export function azAltToDirection(azimuth: number, altitude: number): [number, number, number] {
  const cosAlt = Math.cos(altitude);
  const x = cosAlt * Math.sin(azimuth);
  const y = Math.sin(altitude);
  const z = -cosAlt * Math.cos(azimuth);
  return [x, y, z];
}
