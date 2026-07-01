import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { isEarthGlobeEnabled } from '../../core/earth/feature';
import { sceneDistanceFromExponent, getSpatialBand } from '../../core/ScaleSpace';
import { useObserverStore } from '../../core/ObserverState';

const PLANET_RADIUS = 2.5;

/** Invisible hit shell so canvas clicks reach Earth entry through stars / history pins. */
export function CosmicEarthClickTarget() {
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const enterEarthMode = useObserverStore((s) => s.enterEarthMode);

  const active = useMemo(() => {
    if (mode !== 'cosmic' || !isEarthGlobeEnabled()) return false;
    const bandId = getSpatialBand(spatialExponent).id;
    return bandId === 'planetary' || bandId === 'terrestrial';
  }, [mode, spatialExponent]);

  if (!active) return null;

  const camDist = sceneDistanceFromExponent(spatialExponent);
  const bodyScale = Math.max(1, camDist / 28);
  const hitScale = bodyScale * 1.12;

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    enterEarthMode();
  };

  return (
    <mesh
      scale={hitScale}
      renderOrder={10}
      onClick={onClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <sphereGeometry args={[PLANET_RADIUS, 32, 24]} />
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
