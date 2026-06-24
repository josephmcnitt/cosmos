import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { AVATAR_HEIGHT, sampleTerrainHeight } from '../core/embodiment';
import { useObserverStore } from '../core/ObserverState';

const SMOOTH = 0.12;

export function EmbodiedCamera() {
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const avatarYaw = useObserverStore((s) => s.avatarYaw);
  const cameraDistance = useObserverStore((s) => s.cameraDistance);
  const currentPos = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame(({ camera }) => {
    const groundY =
      sampleTerrainHeight(avatarPosition.x, avatarPosition.z) + AVATAR_HEIGHT * 0.5;
    const target = new THREE.Vector3(
      avatarPosition.x - Math.sin(avatarYaw) * cameraDistance,
      groundY + cameraDistance * 0.35,
      avatarPosition.z - Math.cos(avatarYaw) * cameraDistance,
    );
    const lookAt = new THREE.Vector3(
      avatarPosition.x,
      groundY + AVATAR_HEIGHT * 0.4,
      avatarPosition.z,
    );

    if (!initialized.current) {
      currentPos.current.copy(target);
      initialized.current = true;
    } else {
      currentPos.current.lerp(target, SMOOTH);
    }

    camera.position.copy(currentPos.current);
    camera.lookAt(lookAt);

    camera.near = 0.05;
    camera.far = 200;
    camera.updateProjectionMatrix();
  });

  return null;
}
