import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { getContinentalLandPolygons } from '../../core/earth/continentalLand';
import { buildSpherePolygonGeometry } from '../../core/earth/spherePolygon';
import { GLOBE_RADIUS } from './EarthGlobe';

const LAND_OFFSET = 1.0015;

export function ContinentalLandmass() {
  const geometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const { ring } of getContinentalLandPolygons()) {
      const geom = buildSpherePolygonGeometry(ring, GLOBE_RADIUS, LAND_OFFSET);
      if (geom) parts.push(geom);
    }
    if (parts.length === 0) return null;
    const merged = mergeGeometries(parts, false);
    for (const p of parts) p.dispose();
    return merged;
  }, []);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#3d5c4a"
        roughness={0.92}
        metalness={0.02}
        emissive="#1a2820"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}
