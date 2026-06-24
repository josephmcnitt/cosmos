import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import {
  AVATAR_HEIGHT,
  clampAvatarToSite,
  sampleTerrainHeight,
} from '../core/embodiment';
import { useObserverStore } from '../core/ObserverState';

export function PlayerAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const avatarYaw = useObserverStore((s) => s.avatarYaw);

  useFrame(() => {
    if (!groupRef.current) return;
    const clamped = clampAvatarToSite(avatarPosition.x, avatarPosition.z);
    const y = sampleTerrainHeight(clamped.x, clamped.z) + AVATAR_HEIGHT * 0.5;
    groupRef.current.position.set(clamped.x, y, clamped.z);
    groupRef.current.rotation.y = avatarYaw;
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <capsuleGeometry args={[0.25, 0.55, 8, 16]} />
        <meshStandardMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>
    </group>
  );
}
