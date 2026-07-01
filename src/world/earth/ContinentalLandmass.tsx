import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildSpherePolygonGeometry } from '../../core/earth/spherePolygon';
import { GLOBE_RADIUS } from './EarthGlobe';

const LAND_OFFSET = 1.0015;

export function ContinentalLandmass() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let disposed = false;
    let merged: THREE.BufferGeometry | null = null;

    void import('../../core/earth/continentalLand').then(({ getContinentalLandPolygons }) => {
      if (disposed) return;

      const parts: THREE.BufferGeometry[] = [];
      for (const { ring } of getContinentalLandPolygons()) {
        const geom = buildSpherePolygonGeometry(ring, GLOBE_RADIUS, LAND_OFFSET);
        if (geom) parts.push(geom);
      }
      if (parts.length === 0) return;

      merged = mergeGeometries(parts, false);
      for (const p of parts) p.dispose();
      if (merged && !disposed) setGeometry(merged);
    });

    return () => {
      disposed = true;
      merged?.dispose();
    };
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
