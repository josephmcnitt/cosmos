import { useMemo } from 'react';
import * as THREE from 'three';

const GLOBE_RADIUS = 5;

export function EarthGlobe() {
  const geometry = useMemo(() => new THREE.SphereGeometry(GLOBE_RADIUS, 48, 32), []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#0f2840"
        roughness={0.9}
        metalness={0.04}
        emissive="#061018"
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}

export { GLOBE_RADIUS };
