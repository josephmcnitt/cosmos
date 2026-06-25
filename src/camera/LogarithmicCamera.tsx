import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useIntroStore } from '../core/IntroState';
import { sceneDistanceFromExponent } from '../core/ScaleSpace';
import { useObserverStore } from '../core/ObserverState';

const SMOOTH = 0.12;

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

/** Forward flight: camera sits on +Z looking at the origin (vanishing point). */
export function LogarithmicCamera() {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const mode = useObserverStore((s) => s.mode);
  const introPhase = useIntroStore((s) => s.phase);
  const { camera, scene } = useThree();

  const targetDistance = useRef(sceneDistanceFromExponent(spatialExponent));
  const currentDistance = useRef(0.3);
  const introPhaseStart = useRef(performance.now());

  useEffect(() => {
    introPhaseStart.current = performance.now();
    if (introPhase === 'complete') {
      const target = sceneDistanceFromExponent(
        useObserverStore.getState().spatialExponent,
      );
      targetDistance.current = target;
      currentDistance.current = target;
    }
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
    const lift = dist * 0.1;
    camera.position.set(0, lift, dist);
    camera.lookAt(0, 0, 0);

    camera.near = Math.max(0.01, dist * 0.001);
    camera.far = Math.max(camera.near + 10, dist * 8 + 800);
    camera.updateProjectionMatrix();

    const fog = scene.fog;
    if (fog instanceof THREE.Fog) {
      fog.near = Math.max(1, dist * 0.25);
      fog.far = Math.max(fog.near + 200, dist * 12 + 400);
    }
  });

  return null;
}
