import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { getStarTexture } from './starPoints';

interface StarLayer {
  geometry: THREE.BufferGeometry;
  count: number;
  zMin: number;
  zMax: number;
  parallax: number;
  spread: number;
  size: number;
  color: string;
  opacity: number;
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
): StarLayer {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
    positions[i * 3 + 2] = -(zMin + Math.random() * (zMax - zMin));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return { geometry, count, zMin, zMax, parallax, spread, size, color, opacity };
}

function FocusDot({ opacity }: { opacity: number }) {
  if (opacity <= 0.01) return null;
  return (
    <mesh position={[0, 0, -0.05]}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color="#fff8e8" transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

export function FlightStarfield() {
  const introPhase = useIntroStore((s) => s.phase);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const { camera } = useThree();
  const prevCamZ = useRef(camera.position.z);
  const starTexture = useMemo(() => getStarTexture(), []);

  const layers = useMemo(
    () => [
      buildLayer(2500, 120, 900, 420, 0.15, 1.4, '#c8d4ff', 0.55),
      buildLayer(1800, 30, 180, 140, 0.45, 0.9, '#dfe4ff', 0.75),
      buildLayer(900, 4, 45, 55, 0.85, 0.45, '#fff4c2', 0.9),
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
      : Math.max(0.01, Math.abs(deltaZ) * 1.4);

    for (const layer of layers) {
      const pos = layer.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < layer.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        z += flySpeed * layer.parallax;
        if (z > camZ + 8) {
          z = -(layer.zMin + Math.random() * (layer.zMax - layer.zMin));
          x = (Math.random() - 0.5) * layer.spread;
          y = (Math.random() - 0.5) * layer.spread * 0.6;
        }
        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }
  });

  const showStars =
    introPhase === 'expansion' || introPhase === 'reveal' || introPhase === 'complete';

  let layerScale = 0;
  if (introPhase === 'expansion') layerScale = 0.4;
  if (introPhase === 'reveal') layerScale = 0.75;
  if (introPhase === 'complete') {
    layerScale = 0.9 + Math.min(0.1, (25 - spatialExponent) / 50);
  }

  const dotOpacity =
    introPhase === 'void' || introPhase === 'ignition'
      ? 1
      : introPhase === 'complete' && spatialExponent < 8
        ? 0
        : Math.max(0.15, 1 - layerScale * 0.85);

  return (
    <group>
      <FocusDot opacity={dotOpacity} />
      {showStars &&
        layers.map((layer, i) => (
          <points key={i} geometry={layer.geometry}>
            <pointsMaterial
              size={layer.size}
              color={layer.color}
              map={starTexture}
              transparent
              opacity={layer.opacity * layerScale}
              sizeAttenuation
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </points>
        ))}
    </group>
  );
}
