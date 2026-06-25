import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleTerrainHeight } from '../core/embodiment';
import { MARKER_TRADITION_COLORS } from '../data/embodied/siteMarkers';
import type { EntityInstance } from '../core/world/types';

export function CorrespondencePortal({ entity }: { entity: EntityInstance }) {
  const ref = useRef<THREE.Mesh>(null);
  const color = MARKER_TRADITION_COLORS.hermetic;

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4;
    }
  });

  const y = sampleTerrainHeight(entity.transform.x, entity.transform.z);

  return (
    <group position={[entity.transform.x, y, entity.transform.z]}>
      <mesh ref={ref} position={[0, 1.2, 0]}>
        <torusGeometry args={[0.8, 0.08, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.65, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color={color} intensity={0.6} distance={4} />
    </group>
  );
}
