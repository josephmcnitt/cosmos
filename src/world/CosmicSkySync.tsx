import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { computeHeavenVisuals } from '../core/materialHeavens';
import { isEphemerisBand } from '../core/heavenVisibility';
import { computeEphemeris, ephemerisDayAmbientBoost } from '../core/ephemeris';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

/** Lerp fog color and ambient intensity from heaven visuals — never touches fog.far. */
export function CosmicSkySync() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const mode = useObserverStore((s) => s.mode);
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const { scene } = useThree();

  const visuals = useMemo(
    () => computeHeavenVisuals(simTimeSeconds),
    [simTimeSeconds],
  );

  const targetFog = useRef(new THREE.Color());
  const ambientTarget = useRef(visuals.ambientScale);

  useFrame((_, delta) => {
    const fog = scene.fog;
    if (fog instanceof THREE.Fog) {
      targetFog.current.set(visuals.fogColor);
      fog.color.lerp(targetFog.current, Math.min(1, delta * 2));
    }

    let ambient = visuals.ambientScale;
    if (isEphemerisBand(simTimeSeconds, spatialExponent, mode, introComplete)) {
      ambient += ephemerisDayAmbientBoost(computeEphemeris().sunAltitude);
    }
    ambientTarget.current = ambient;

    const ambientLight = scene.children.find(
      (c) => c instanceof THREE.AmbientLight,
    ) as THREE.AmbientLight | undefined;
    if (ambientLight) {
      ambientLight.intensity = THREE.MathUtils.lerp(
        ambientLight.intensity,
        ambientTarget.current,
        Math.min(1, delta * 3),
      );
    }
  });

  return null;
}
