import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { latLngToSphereUnit } from './geo';

/** GeoJSON ring: [longitude, latitude] degrees. */
export type LngLatRing = [number, number][];

export function lngLatRingToSpherePoints(
  ring: LngLatRing,
  radius: number,
  surfaceOffset = 1.001,
): Vector3[] {
  const scale = radius * surfaceOffset;
  return ring.map(([lng, lat]) => latLngToSphereUnit(lat, lng).multiplyScalar(scale));
}

/** Fan-triangulate a polygon on the sphere (centroid hub). */
export function buildSpherePolygonGeometry(
  ring: LngLatRing,
  radius: number,
  surfaceOffset = 1.001,
): BufferGeometry | null {
  if (ring.length < 3) return null;

  const pts = lngLatRingToSpherePoints(ring, radius, surfaceOffset);
  const hub = new Vector3();
  for (const p of pts) hub.add(p);
  if (hub.lengthSq() === 0) return null;
  hub.normalize().multiplyScalar(radius * surfaceOffset);

  const positions: number[] = [hub.x, hub.y, hub.z];
  for (const p of pts) {
    positions.push(p.x, p.y, p.z);
  }

  const indices: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    indices.push(0, i, i + 1);
  }
  indices.push(0, pts.length, 1);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
