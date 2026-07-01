import { Vector3 } from 'three';

const DEG = Math.PI / 180;

/** Unit sphere point from WGS84-ish lat/lng (degrees). Y-up, lat=0 at equator. */
export function latLngToSphereUnit(lat: number, lng: number): Vector3 {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  );
}

export function sphereUnitToLatLng(v: Vector3): { lat: number; lng: number } {
  const n = v.clone().normalize();
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, n.y))) / DEG;
  const lng = Math.atan2(n.z, -n.x) / DEG - 180;
  return { lat, lng: ((lng + 540) % 360) - 180 };
}

/** Ray-sphere intersection; returns surface point or null. */
export function raySphereHit(
  origin: Vector3,
  direction: Vector3,
  radius: number,
): Vector3 | null {
  const o = origin;
  const d = direction.clone().normalize();
  const b = o.dot(d);
  const c = o.dot(o) - radius * radius;
  const disc = b * b - c;
  if (disc < 0) return null;
  const t = -b - Math.sqrt(disc);
  if (t < 0) return null;
  return o.clone().add(d.multiplyScalar(t)).normalize().multiplyScalar(radius);
}

/** Great-circle distance on unit sphere (radians). */
export function angularDistance(a: Vector3, b: Vector3): number {
  return Math.acos(Math.max(-1, Math.min(1, a.clone().normalize().dot(b.clone().normalize()))));
}

/** Haversine distance in degrees between two lat/lng points. */
export function latLngDistanceDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const a = latLngToSphereUnit(lat1, lng1);
  const b = latLngToSphereUnit(lat2, lng2);
  return (angularDistance(a, b) * 180) / Math.PI;
}
