import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useIntroStore } from '../core/IntroState';
import { sceneDistanceFromExponent } from '../core/ScaleSpace';
import { useObserverStore } from '../core/ObserverState';

const SMOOTH = 0.1;

function introCameraDistance(phase: string, elapsedMs: number): number {
  switch (phase) {
    case 'void':
      return 0.3;
    case 'ignition':
      return 0.3 + (elapsedMs / 1500) * 2;
    case 'expansion':
      return 2.5 + (elapsedMs / 3500) * 80;
    case 'reveal':
      return 82 + (elapsedMs / 2000) * 100;
    default:
      return sceneDistanceFromExponent(25);
  }
}

export function LogarithmicCamera() {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const focusPoint = useObserverStore((s) => s.focusPoint);
  const mode = useObserverStore((s) => s.mode);
  const introPhase = useIntroStore((s) => s.phase);
  const { camera, scene } = useThree();

  const targetDistance = useRef(sceneDistanceFromExponent(spatialExponent));
  const currentDistance = useRef(0.3);
  const spherical = useRef(new THREE.Spherical(1, Math.PI * 0.35, Math.PI * 0.15));
  const introPhaseStart = useRef(performance.now());

  useEffect(() => {
    introPhaseStart.current = performance.now();
  }, [introPhase]);

  useFrame(() => {
    if (mode === 'embodied') return;

    const introActive = introPhase !== 'complete';
    const introElapsed = performance.now() - introPhaseStart.current;

    targetDistance.current = introActive
      ? introCameraDistance(introPhase, introElapsed)
      : sceneDistanceFromExponent(spatialExponent);

    currentDistance.current = THREE.MathUtils.lerp(
      currentDistance.current,
      targetDistance.current,
      introActive ? 0.06 : SMOOTH,
    );

    const dist = currentDistance.current;
    const offset = new THREE.Vector3().setFromSpherical(spherical.current);
    offset.multiplyScalar(dist);

    camera.position.copy(focusPoint).add(offset);
    camera.lookAt(focusPoint);

    camera.near = Math.max(0.01, dist * 0.001);
    camera.far = Math.max(camera.near + 10, dist * 8 + 500);
    camera.updateProjectionMatrix();

    const fog = scene.fog;
    if (fog instanceof THREE.Fog) {
      fog.near = Math.max(1, dist * 0.35);
      fog.far = Math.max(fog.near + 50, dist * 2.5 + 100);
    }
  });

  return null;
}
