import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { bigBangReplayFrame } from '../core/bigBangReplay';
import { useIntroStore, INTRO_EXPANSION_MS, INTRO_IGNITION_MS, INTRO_REVEAL_MS } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { getStarTexture } from './starPoints';

const EXPLOSION_DURATION = INTRO_IGNITION_MS + INTRO_EXPANSION_MS;

interface ParticleData {
  geometry: THREE.BufferGeometry;
  velocities: Float32Array;
  count: number;
}

function applyBigBangVisuals(
  burstT: number,
  revealFade: number,
  intensity: number,
  coreRef: RefObject<THREE.Mesh | null>,
  shellRef: RefObject<THREE.Mesh | null>,
  particles: ParticleData,
  particlesMatRef: RefObject<THREE.PointsMaterial | null>,
  revealDrift: boolean,
): void {
  const eased = 1 - Math.pow(1 - Math.min(burstT, 1), 3);
  const amp = intensity * revealFade;

  const coreScale = 0.2 + eased * 12;
  const shellScale = 0.5 + eased * 40;

  if (coreRef.current) {
    coreRef.current.scale.setScalar(coreScale);
    const mat = coreRef.current.material as THREE.MeshBasicMaterial;
    const coreBurst =
      burstT < 0.15 ? burstT / 0.15 : Math.max(0, 1 - (burstT - 0.15) * 1.4);
    mat.opacity = coreBurst * amp;
  }

  if (shellRef.current) {
    shellRef.current.scale.setScalar(shellScale * (1 + (1 - revealFade) * 0.15));
    const mat = shellRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 0.55 * (1 - burstT * 0.85)) * amp;
  }

  const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
  const drift = revealDrift ? 1 + (1 - revealFade) * 0.08 : 1;
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
    particlesMatRef.current.opacity = Math.max(0, 0.85 * amp);
  }
}

export function BigBangEffect() {
  const phase = useIntroStore((s) => s.phase);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const mode = useObserverStore((s) => s.mode);
  const introComplete = phase === 'complete';
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
    geo.computeBoundingSphere();
    return { geometry: geo, velocities, count };
  }, []);

  useEffect(() => {
    if (phase === 'ignition') ignitionStart.current = performance.now();
    if (phase !== 'ignition' && phase !== 'expansion') ignitionStart.current = null;
    if (phase === 'reveal') revealStart.current = performance.now();
    if (phase !== 'reveal') revealStart.current = null;
  }, [phase]);

  const introActive = phase === 'ignition' || phase === 'expansion' || phase === 'reveal';
  const scrubFrame =
    introComplete && mode === 'cosmic' ? bigBangReplayFrame(simTimeSeconds) : null;
  const visible = introActive || scrubFrame != null;

  useFrame(() => {
    if (!visible) return;

    if (introActive) {
      let burstT = 0;
      if (phase === 'ignition' || phase === 'expansion') {
        if (ignitionStart.current === null) ignitionStart.current = performance.now();
        burstT = (performance.now() - ignitionStart.current) / EXPLOSION_DURATION;
      } else if (phase === 'reveal') {
        burstT = 1;
      }

      let revealFade = 1;
      if (phase === 'reveal' && revealStart.current !== null) {
        const revealT = (performance.now() - revealStart.current) / INTRO_REVEAL_MS;
        revealFade = Math.max(0, 1 - revealT);
      }

      applyBigBangVisuals(
        burstT,
        revealFade,
        1,
        coreRef,
        shellRef,
        particles,
        particlesMatRef,
        phase === 'reveal',
      );
      return;
    }

    if (scrubFrame) {
      applyBigBangVisuals(
        scrubFrame.burstT,
        1,
        scrubFrame.intensity,
        coreRef,
        shellRef,
        particles,
        particlesMatRef,
        false,
      );
    }
  });

  if (!visible) return null;
  if (phase === 'void') return null;

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#fff8e8" transparent opacity={0} toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#ff6622"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <points frustumCulled={false}>
        <primitive attach="geometry" object={particles.geometry} />
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
          fog={false}
        />
      </points>
      <pointLight color="#ffaa66" intensity={visible ? 8 : 0} distance={200} decay={2} />
    </group>
  );
}
