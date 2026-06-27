import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { sampleTerrainHeight } from '../core/embodiment';
import { worldRegistry } from '../core/world/WorldRegistry';
import type { EntityInstance } from '../core/world/types';
import { useWorldStore } from '../core/world/WorldState';
import { HumanoidFigure } from './HumanoidFigure';

export function NpcAvatar({ entity }: { entity: EntityInstance }) {
  const groupRef = useRef<THREE.Group>(null);
  const actor = worldRegistry.getActor(entity.defId);
  const initiationStatus = useWorldStore((s) => s.initiationStatus[entity.worldId]);
  const showGuideBeacon =
    entity.kind === 'actor' &&
    actor?.initiationId != null &&
    (initiationStatus === 'available' || initiationStatus === 'in_progress');
  const baseY = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const y = sampleTerrainHeight(entity.transform.x, entity.transform.z);
    baseY.current = y + 0.45;
    groupRef.current.position.set(entity.transform.x, baseY.current, entity.transform.z);
    groupRef.current.rotation.y = entity.transform.yaw ?? 0;
    groupRef.current.position.y += Math.sin(performance.now() * 0.001) * 0.02;
  });

  const robeColor = (entity.state.robeColor as string) ?? actor?.robeColor ?? '#a0a8b8';
  const bodyColor = '#e8c4a0';

  return (
    <group ref={groupRef}>
      {showGuideBeacon && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
            <ringGeometry args={[0.55, 0.85, 32]} />
            <meshBasicMaterial color="#e8dcc0" transparent opacity={0.5} depthWrite={false} />
          </mesh>
          <pointLight color="#e8dcc0" intensity={1.8} distance={8} decay={2} position={[0, 1.6, 0]} />
        </>
      )}
      <HumanoidFigure bodyColor={bodyColor} robeColor={robeColor} showEyes />
    </group>
  );
}
