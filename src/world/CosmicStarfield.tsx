import { Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Material, Points } from 'three';
import { computeHeavenVisuals } from '../core/materialHeavens';
import { starfieldBrightness } from '../core/heavenVisibility';
import { useObserverStore } from '../core/ObserverState';

/** Universe-scale starfield with time-driven brightness from computeHeavenVisuals. */
export function CosmicStarfield() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const pointsRef = useRef<Points>(null);

  const brightness = useMemo(() => {
    const { starfieldOpacity } = computeHeavenVisuals(simTimeSeconds);
    return starfieldBrightness(starfieldOpacity);
  }, [simTimeSeconds]);

  const starFactor = useMemo(() => 0.4 + brightness * 6.6, [brightness]);
  const starCount = useMemo(() => Math.round(1200 + brightness * 7800), [brightness]);

  useFrame(() => {
    const mat = pointsRef.current?.material as Material | undefined;
    if (!mat) return;
    mat.transparent = true;
    mat.opacity = brightness;
    mat.depthWrite = false;
  });

  return (
    <Stars
      key={`${starFactor.toFixed(1)}-${starCount}`}
      ref={pointsRef}
      radius={320}
      depth={120}
      count={starCount}
      factor={starFactor}
      saturation={0.15}
      fade={false}
      speed={0}
    />
  );
}
