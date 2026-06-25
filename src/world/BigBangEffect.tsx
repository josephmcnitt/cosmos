import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  INTRO_EXPANSION_MS,
  INTRO_IGNITION_MS,
  INTRO_REVEAL_MS,
  useIntroStore,
} from '../core/IntroState';
import { getStarTexture } from './starPoints';

const EXPLOSION_DURATION = INTRO_IGNITION_MS + INTRO_EXPANSION_MS;

export function BigBangEffect() {
  const phase = useIntroStore((s) => s.phase);
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const particlesMatRef = useRef<THREE.PointsMaterial>(null);
  const ignitionStart = useRef<number | null>(null);
  const revealStart = useRef<number | null>(null);
  const starTexture = useMemo(() => getStarTexture(), []);

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

  useEffect(() => {
    if (phase === 'ignition') ignitionStart.current = performance.now();
    if (phase !== 'ignition' && phase !== 'expansion') ignitionStart.current = null;
    if (phase === 'reveal') revealStart.current = performance.now();
    if (phase !== 'reveal') revealStart.current = null;
  }, [phase]);

  const active = phase === 'ignition' || phase === 'expansion' || phase === 'reveal';

  useFrame(() => {
    if (!active) return;

    let burstT = 0;
    if (phase === 'ignition' || phase === 'expansion') {
      if (ignitionStart.current === null) ignitionStart.current = performance.now();
      burstT = (performance.now() - ignitionStart.current) / EXPLOSION_DURATION;
    } else if (phase === 'reveal') {
      burstT = 1;
    }
    const eased = 1 - Math.pow(1 - Math.min(burstT, 1), 3);

    let revealFade = 1;
    if (phase === 'reveal' && revealStart.current !== null) {
      const revealT = (performance.now() - revealStart.current) / INTRO_REVEAL_MS;
      revealFade = Math.max(0, 1 - revealT);
    }

    const coreScale = 0.2 + eased * 12;
    const shellScale = 0.5 + eased * 40;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(coreScale);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      const coreBurst =
        burstT < 0.15 ? burstT / 0.15 : Math.max(0, 1 - (burstT - 0.15) * 1.4);
      mat.opacity = coreBurst * revealFade;
    }

    if (shellRef.current) {
      shellRef.current.scale.setScalar(shellScale * (1 + (1 - revealFade) * 0.15));
      const mat = shellRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.55 * (1 - burstT * 0.85)) * revealFade;
    }

    const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const drift = phase === 'reveal' ? 1 + (1 - revealFade) * 0.08 : 1;
    for (let i = 0; i < particles.count; i++) {
      const speed = (8 + (i % 5) * 1.5) * eased * drift;
      posAttr.setXYZ(
        i,
        particles.velocities[i * 3]! * speed,
        particles.velocities[i * 3 + 1]! * speed,
        particles.velocities[i * 3 + 2]! * speed,
      );
    }
    posAttr.needsUpdate = true;

    if (particlesMatRef.current) {
      particlesMatRef.current.opacity = Math.max(0, 0.85 * revealFade);
    }
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
          ref={particlesMatRef}
          size={0.35}
          color="#ffcc88"
          map={starTexture}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <pointLight color="#ffaa66" intensity={active ? 8 : 0} distance={200} decay={2} />
    </group>
  );
}
