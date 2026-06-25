import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { computeHeavenVisuals, type HeavenVisuals } from '../core/materialHeavens';
import { useObserverStore } from '../core/ObserverState';
import { WorldRoot } from './WorldRoot';

function CosmicFogSync({ visuals }: { visuals: HeavenVisuals }) {
  const { scene } = useThree();
  const targetColor = useRef(new THREE.Color());

  useFrame((_, delta) => {
    const fog = scene.fog;
    if (!(fog instanceof THREE.Fog)) return;

    targetColor.current.set(visuals.fogColor);
    fog.color.lerp(targetColor.current, Math.min(1, delta * 2));

    const eraScale = 0.55 + (1 - visuals.fogDensity * 0.55) * 0.45;
    fog.far = Math.max(fog.near + 50, fog.far * eraScale);
  }, 1);

  return null;
}

export function MaterialHeavens() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const visuals = useMemo(() => computeHeavenVisuals(simTimeSeconds), [simTimeSeconds]);

  return (
    <>
      <CosmicFogSync visuals={visuals} />
      <WorldRoot modifiers={{ bandScale: visuals.bandScale, ambientScale: visuals.ambientScale }} />
    </>
  );
}
