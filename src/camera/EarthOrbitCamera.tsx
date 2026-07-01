import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useObserverStore } from '../core/ObserverState';

const SMOOTH = 0.1;

export function EarthOrbitCamera() {
  const earthRotation = useObserverStore((s) => s.earthRotation);
  const earthOrbitDistance = useObserverStore((s) => s.earthOrbitDistance);
  const { camera, scene } = useThree();

  const currentPos = useRef(new THREE.Vector3(0, 0, 20));
  const targetPos = useRef(new THREE.Vector3(0, 0, 20));

  useFrame(() => {
    const { yaw, pitch } = earthRotation;
    const dist = earthOrbitDistance;
    const cosP = Math.cos(pitch);
    targetPos.current.set(
      dist * Math.sin(yaw) * cosP,
      dist * Math.sin(pitch),
      dist * Math.cos(yaw) * cosP,
    );
    currentPos.current.lerp(targetPos.current, SMOOTH);
    camera.position.copy(currentPos.current);
    camera.lookAt(0, 0, 0);

    camera.near = 0.1;
    camera.far = Math.max(500, dist * 4);
    camera.updateProjectionMatrix();

    const fog = scene.fog;
    if (fog instanceof THREE.Fog) {
      fog.near = Math.max(1, dist * 0.4);
      fog.far = Math.max(fog.near + 100, dist * 3);
    }
  });

  return null;
}
