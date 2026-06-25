import { Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Material, Points } from 'three';
import { computeHeavenVisuals } from '../core/materialHeavens';
import { starfieldBrightness } from '../core/heavenVisibility';
import { useObserverStore } from '../core/ObserverState';

/** Universe-scale starfield with time-driven brightness from computeHeavenVisuals. */
export function CosmicStarfield() {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTime = useObserverStore((s) => s.simTimeSeconds);
  const pointsRef = useRef<Points>(null);

  const brightness = useMemo(() => {
    const { starfieldOpacity } = computeHeavenVisuals(simTime);
    return starfieldBrightness(starfieldOpacity);
  }, [simTime]);

  useFrame(() => {
    const mat = pointsRef.current?.material as Material | undefined;
    if (!mat) return;
    const universeFade =
      spatialExponent > 22 ? Math.max(0, 1 - (spatialExponent - 22) / 3) : 1;
    mat.transparent = true;
    mat.opacity = brightness * universeFade;
    mat.depthWrite = false;
  });

  return (
    <Stars
      ref={pointsRef}
      radius={480}
      depth={200}
      count={5000}
      factor={4}
      saturation={0.12}
      fade
      speed={0}
    />
  );
}
