import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { sampleTerrainHeight } from '../core/embodiment';
import { getInitiationById, getStep } from '../data/initiations/index';
import { useWorldStore } from '../core/world/WorldState';

function WalkBeaconRing({ targetX, targetZ, radius }: { targetX: number; targetZ: number; radius: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const y = sampleTerrainHeight(targetX, targetZ);

  useFrame(({ clock }) => {
    const ring = ringRef.current;
    if (!ring) return;
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 2.2) * 0.15;
    ring.scale.setScalar(pulse);
  });

  return (
    <group position={[targetX, y + 0.08, targetZ]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.55, radius * 0.95, 48]} />
        <meshBasicMaterial color="#d4e8a0" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.35, 32]} />
        <meshBasicMaterial color="#e8f4c8" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <pointLight color="#c8e088" intensity={2.2} distance={14} decay={2} position={[0, 2.5, 0]} />
    </group>
  );
}

/** Ground ring + soft light at active walk-to initiation targets. */
export function InitiationWalkBeacon() {
  const activeInitiation = useWorldStore((s) => s.activeInitiation);

  if (!activeInitiation) return null;

  const def = getInitiationById(activeInitiation.initiationId);
  const step = def ? getStep(def, activeInitiation.stepIndex) : undefined;
  if (!step || step.type !== 'walk-to') return null;

  const radius = step.radius ?? 3;
  return <WalkBeaconRing targetX={step.targetX} targetZ={step.targetZ} radius={radius} />;
}
