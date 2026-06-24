import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { INTRO_EXPANSION_MS, INTRO_IGNITION_MS, useIntroStore } from '../core/IntroState';

const EXPLOSION_DURATION = INTRO_IGNITION_MS + INTRO_EXPANSION_MS;

export function BigBangEffect() {
  const phase = useIntroStore((s) => s.phase);
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const startedAt = useRef<number | null>(null);

  const particles = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
      velocities[i * 3 + 2] = Math.cos(phi);
      positions[i * 3] = velocities[i * 3]! * 0.01;
      positions[i * 3 + 1] = velocities[i * 3 + 1]! * 0.01;
      positions[i * 3 + 2] = velocities[i * 3 + 2]! * 0.01;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, velocities, count };
  }, []);

  const active = phase === 'ignition' || phase === 'expansion' || phase === 'reveal';

  useFrame(() => {
    if (!active) {
      startedAt.current = null;
      return;
    }

    if (startedAt.current === null) startedAt.current = performance.now();
    const t = (performance.now() - startedAt.current) / EXPLOSION_DURATION;
    const eased = 1 - Math.pow(1 - Math.min(t, 1), 3);

    const coreScale = 0.2 + eased * 12;
    const shellScale = 0.5 + eased * 40;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(coreScale);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - 0.15) * 1.4);
    }

    if (shellRef.current) {
      shellRef.current.scale.setScalar(shellScale);
      const mat = shellRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.55 * (1 - t * 0.85));
    }

    const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < particles.count; i++) {
    const speed = (8 + (i % 5) * 1.5) * eased;
      posAttr.setXYZ(
        i,
        particles.velocities[i * 3]! * speed,
        particles.velocities[i * 3 + 1]! * speed,
        particles.velocities[i * 3 + 2]! * speed,
      );
    }
    posAttr.needsUpdate = true;
  });

  if (!active && phase === 'complete') return null;
  if (phase === 'void') return null;

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#fff8e8" transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#ff6622"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <points geometry={particles.geometry}>
        <pointsMaterial
          size={0.35}
          color="#ffcc88"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </points>
      <pointLight color="#ffaa66" intensity={active ? 8 : 0} distance={200} decay={2} />
    </group>
  );
}
