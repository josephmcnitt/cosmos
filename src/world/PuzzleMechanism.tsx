import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleTerrainHeight } from '../core/embodiment';
import type { EntityInstance } from '../core/world/types';

export function PuzzleMechanism({ entity }: { entity: EntityInstance }) {
  const ref = useRef<THREE.Group>(null);
  const completed = entity.state.completed === true;
  const rotations = (entity.state.ringRotations as number[]) ?? [0, 0, 0];

  useFrame((_, delta) => {
    if (ref.current && !completed) {
      ref.current.rotation.y += delta * 0.05;
    }
  });

  const y = sampleTerrainHeight(entity.transform.x, entity.transform.z);

  if (completed) return null;

  return (
    <group
      ref={ref}
      position={[entity.transform.x, y + 0.8, entity.transform.z]}
    >
      <pointLight color="#4ecdc4" intensity={1.8} distance={8} decay={2} position={[0, 0.5, 0]} />
      {rotations.map((rot, i) => (
        <mesh key={i} rotation={[0, (rot * Math.PI) / 2, 0]} position={[0, i * 0.45, 0]}>
          <torusGeometry args={[0.65 + i * 0.18, 0.06, 8, 24]} />
          <meshStandardMaterial
            color={i === 0 ? '#4ecdc4' : i === 1 ? '#c8a860' : '#b088f0'}
            emissive={i === 0 ? '#2a8880' : i === 1 ? '#886830' : '#6848a0'}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}
