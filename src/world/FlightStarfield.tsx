import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { StarBillboards } from './StarBillboards';

interface StarLayer {
  positions: Float32Array;
  count: number;
  zMin: number;
  zMax: number;
  parallax: number;
  spread: number;
  size: number;
  color: string;
  opacity: number;
  /** Only rendered after intro (close “rush” stars). */
  postIntroOnly?: boolean;
}

function buildLayer(
  count: number,
  zMin: number,
  zMax: number,
  spread: number,
  parallax: number,
  size: number,
  color: string,
  opacity: number,
  postIntroOnly = false,
): StarLayer {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
    positions[i * 3 + 2] = -(zMin + Math.random() * (zMax - zMin));
  }
  return { positions, count, zMin, zMax, parallax, spread, size, color, opacity, postIntroOnly };
}

function respawnStar(layer: StarLayer, i: number): void {
  layer.positions[i * 3] = (Math.random() - 0.5) * layer.spread;
  layer.positions[i * 3 + 1] = (Math.random() - 0.5) * layer.spread * 0.6;
  layer.positions[i * 3 + 2] = -(layer.zMin + Math.random() * (layer.zMax - layer.zMin));
}

/** Stronger near universe/galaxy zoom; fades inside planetary band meshes. */
function parallaxWeight(spatialExponent: number): number {
  const lo = 12;
  const hi = 18;
  if (spatialExponent <= lo) return 0;
  if (spatialExponent >= hi) return 1;
  return (spatialExponent - lo) / (hi - lo);
}

/** Fade rush / close stars when pulling back to galaxy scale. */
function closeLayerFade(spatialExponent: number): number {
  const start = 15;
  const end = 20;
  if (spatialExponent <= start) return 1;
  if (spatialExponent >= end) return 0;
  return 1 - (spatialExponent - start) / (end - start);
}

function FocusDot({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (mesh) mesh.raycast = () => {};
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, -0.05]}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color="#fff8e8" transparent opacity={opacity} toneMapped={false} fog={false} />
    </mesh>
  );
}

export function FlightStarfield() {
  const introPhase = useIntroStore((s) => s.phase);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const { camera } = useThree();
  const prevCamZ = useRef(camera.position.z);

  const layers = useMemo(
    () => [
      buildLayer(2200, 140, 950, 440, 0.1, 1.3, '#b8c8ff', 0.4),
      buildLayer(1600, 35, 200, 150, 0.48, 1.0, '#dfe4ff', 0.65),
      buildLayer(800, 5, 50, 58, 0.92, 0.55, '#fff0c0', 0.8),
      buildLayer(420, 0.6, 24, 72, 1.2, 1.25, '#fffff0', 0.95, true),
    ],
    [],
  );

  useFrame(() => {
    const introActive = introPhase !== 'complete';
    const camZ = camera.position.z;
    const deltaZ = camZ - prevCamZ.current;
    prevCamZ.current = camZ;

    const flySpeed = introActive
      ? Math.max(0.15, Math.abs(deltaZ) * 2.5)
      : Math.max(0.04, Math.abs(deltaZ) * 3.2);

    const driftSign = introActive ? 1 : deltaZ > 0 ? -1 : deltaZ < 0 ? 1 : 0;

    for (const layer of layers) {
      for (let i = 0; i < layer.count; i++) {
        let x = layer.positions[i * 3]!;
        let y = layer.positions[i * 3 + 1]!;
        let z = layer.positions[i * 3 + 2]!;
        if (driftSign !== 0) {
          z += flySpeed * layer.parallax * driftSign;
        }
        if (z > camZ + 8) {
          respawnStar(layer, i);
          continue;
        }
        if (!introActive && z < -camZ - layer.zMax - 16) {
          respawnStar(layer, i);
          continue;
        }
        layer.positions[i * 3] = x;
        layer.positions[i * 3 + 1] = y;
        layer.positions[i * 3 + 2] = z;
      }
    }
  });

  const introComplete = introPhase === 'complete';
  const showStars =
    introPhase === 'expansion' || introPhase === 'reveal' || introComplete;

  let layerScale = 0;
  if (introPhase === 'expansion') layerScale = 0.4;
  if (introPhase === 'reveal') layerScale = 0.75;
  if (introComplete) {
    layerScale = 0.8 + parallaxWeight(spatialExponent) * 0.2;
  }

  const zoomWeight = introComplete ? parallaxWeight(spatialExponent) : 1;
  const closeFade = introComplete ? closeLayerFade(spatialExponent) : 1;

  const dotOpacity =
    introPhase === 'void' || introPhase === 'ignition'
      ? 1
      : introComplete && spatialExponent < 8
        ? 0
        : Math.max(0.15, 1 - layerScale * 0.85);

  return (
    <group>
      <FocusDot opacity={dotOpacity} />
      {showStars &&
        zoomWeight > 0.01 &&
        layers.map((layer, i) => {
          if (layer.postIntroOnly && !introComplete) return null;
          const nearLayer = i >= 2;
          const opacity =
            layer.opacity * layerScale * zoomWeight * (nearLayer ? closeFade : 1);
          if (opacity <= 0.01) return null;
          const sizeBoost = layer.postIntroOnly ? 1.15 : 1;
          return (
            <StarBillboards
              key={i}
              positions={layer.positions}
              color={layer.color}
              opacity={opacity}
              pixelSize={layer.size * 3.5 * sizeBoost}
            />
          );
        })}
    </group>
  );
}
