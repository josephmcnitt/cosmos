import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MARKER_TRADITION_COLORS } from '../data/embodied/siteMarkers';
import { usePracticeStore } from '../core/PracticeState';
import { useRealmDisplayStore } from '../core/RealmDisplayState';

const MATERIAL_FOG = new THREE.Color('#030508');
const LIMINAL_BASE = new THREE.Color('#1a0a2e');

function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export function LiminalEffects() {
  const { scene } = useThree();
  const spiritualDepth = usePracticeStore((s) => s.spiritualDepth);
  const liminalWeight = useRealmDisplayStore((s) => s.liminalWeight);
  const spiritualWeight = useRealmDisplayStore((s) => s.spiritualWeight);
  const dominantTradition = usePracticeStore((s) => s.dominantTradition);
  const targetFog = useRef(new THREE.Color());
  const particles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 0.5 + Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const traditionColor = dominantTradition
    ? hexToColor(MARKER_TRADITION_COLORS[dominantTradition])
    : LIMINAL_BASE;

  const blend = liminalWeight + spiritualWeight * 0.5;

  useFrame((_, delta) => {
    if (!(scene.fog instanceof THREE.Fog) || blend < 0.01) return;

    const intensity = 0.35 + spiritualDepth * 0.45 + spiritualWeight * 0.2;

    targetFog.current.copy(MATERIAL_FOG).lerp(traditionColor, intensity * blend);
    scene.fog.color.lerp(targetFog.current, Math.min(1, delta * 2));
  });

  if (blend < 0.01) return null;

  const particleOpacity = (0.28 + spiritualDepth * 0.35 + spiritualWeight * 0.25) * blend;

  return (
    <>
      <pointLight
        position={[0, 6, 0]}
        color={traditionColor}
        intensity={(0.8 + spiritualDepth * 1.2) * blend}
        distance={40}
      />
      <pointLight
        position={[-8, 3, 6]}
        color={traditionColor}
        intensity={(0.2 + spiritualDepth * 0.4) * blend}
        distance={30}
      />
      <points geometry={particles}>
        <pointsMaterial
          size={0.12}
          color={traditionColor}
          transparent
          opacity={particleOpacity}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
