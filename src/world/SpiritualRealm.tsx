import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MARKER_TRADITION_COLORS } from '../data/embodied/siteMarkers';
import { sampleTerrainHeight } from '../core/embodiment';
import { usePracticeStore } from '../core/PracticeState';
import { useRealmDisplayStore } from '../core/RealmDisplayState';
import { getActiveAgeDefinition } from '../core/world/WorldRegistry';
import { useWorldStore } from '../core/world/WorldState';

export function SpiritualRealm() {
  const spiritualDepth = usePracticeStore((s) => s.spiritualDepth);
  const spiritualWeight = useRealmDisplayStore((s) => s.spiritualWeight);
  const dominantTradition = usePracticeStore((s) => s.dominantTradition);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const worldLayer = useWorldStore((s) => s.worldLayers[s.currentWorldId] ?? 'material');
  const groupRef = useRef<THREE.Group>(null);

  const age = getActiveAgeDefinition(currentWorldId);
  const geometry = age.esotericLayer.geometry;

  const color = useMemo(() => {
    const hex = dominantTradition
      ? MARKER_TRADITION_COLORS[dominantTradition]
      : MARKER_TRADITION_COLORS[age.esotericLayer.tradition] ?? '#c8b8e8';
    return new THREE.Color(hex);
  }, [dominantTradition, age.esotericLayer.tradition]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const showRealm = spiritualWeight > 0.01 || worldLayer === 'esoteric';
  if (!showRealm) return null;

  const opacity =
    worldLayer === 'esoteric'
      ? 0.55 + spiritualDepth * 0.25
      : (0.25 + spiritualDepth * 0.35) * spiritualWeight;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {geometry === 'torus-knot' && (
        <mesh position={[0, 3 + sampleTerrainHeight(0, 0), 0]}>
          <torusKnotGeometry args={[2.2, 0.35, 128, 16, 2, 3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={opacity}
            roughness={0.3}
            metalness={0.6}
            depthWrite={false}
          />
        </mesh>
      )}
      {(geometry === 'hermetic-spheres' || geometry === 'neoplatonic-rings') && (
        <>
          {[1.5, 2.5, 3.5].map((r, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 2 + i * 0.5, 0]}>
              <ringGeometry args={[r, r + 0.15, 48]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity * (0.9 - i * 0.15)}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </>
      )}
      {geometry === 'gnostic-dual' && (
        <>
          <mesh position={[-1.5, 2.5, 0]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} wireframe />
          </mesh>
          <mesh position={[1.5, 2.5, 0]}>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#b088f0" transparent opacity={opacity * 0.8} wireframe />
          </mesh>
        </>
      )}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}>
        <ringGeometry args={[4, 4.4, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.cos(angle) * 5;
        const z = Math.sin(angle) * 5;
        const y = sampleTerrainHeight(x, z) + 1.2;
        return (
          <mesh key={i} position={[x, y, z]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={opacity * 0.9}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
