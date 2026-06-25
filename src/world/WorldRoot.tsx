import { useMemo, type ComponentType } from 'react';
import * as THREE from 'three';
import { getBandOpacity, SPATIAL_BANDS } from '../core/ScaleSpace';
import { useObserverStore } from '../core/ObserverState';

function UniverseBand({ opacity }: { opacity: number }) {
  const geometry = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={1.2}
        color="#c8d4ff"
        transparent
        opacity={opacity * 0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function GalaxyBand({ opacity }: { opacity: number }) {
  const geometry = useMemo(() => {
    const arms = 4;
    const coords: number[] = [];
    for (let arm = 0; arm < arms; arm++) {
      const offset = (arm / arms) * Math.PI * 2;
      for (let i = 0; i < 120; i++) {
        const t = i / 120;
        const r = 2 + t * 18;
        const angle = offset + t * Math.PI * 3;
        coords.push(
          Math.cos(angle) * r + (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 0.8,
          Math.sin(angle) * r + (Math.random() - 0.5) * 1.5,
        );
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(coords), 3));
    return geo;
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 22, 64]} />
        <meshBasicMaterial
          color="#8a9eff"
          transparent
          opacity={opacity * 0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <points geometry={geometry}>
        <pointsMaterial
          size={0.5}
          color="#dfe4ff"
          transparent
          opacity={opacity * 0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function StellarBand({ opacity }: { opacity: number }) {
  if (opacity <= 0.01) return null;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#fff4c2" transparent opacity={opacity} />
      </mesh>
      <mesh scale={[3, 3, 3]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color="#ff8844"
          transparent
          opacity={opacity * 0.12}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[4, 0.5, -2]} scale={0.15}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#aaccff" transparent opacity={opacity * 0.7} />
      </mesh>
    </group>
  );
}

function PlanetaryBand({ opacity }: { opacity: number }) {
  if (opacity <= 0.01) return null;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[2.5, 48, 48]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.85}
          metalness={0.05}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#7ec8ff"
          transparent
          opacity={opacity * 0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function TerrestrialBand({ opacity }: { opacity: number }) {
  if (opacity <= 0.01) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[40, 40, 32, 32]} />
      <meshStandardMaterial
        color="#2d5a3d"
        roughness={0.95}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function HumanBand({ opacity }: { opacity: number }) {
  if (opacity <= 0.01) return null;

  return (
    <group position={[0, 0.9, 0]}>
      <mesh>
        <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
        <meshStandardMaterial
          color="#e8c4a0"
          roughness={0.7}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.75, 32]} />
        <meshBasicMaterial
          color="#88ffcc"
          transparent
          opacity={opacity * 0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

const BAND_COMPONENTS: Record<string, ComponentType<{ opacity: number }>> = {
  universe: UniverseBand,
  galaxy: GalaxyBand,
  stellar: StellarBand,
  planetary: PlanetaryBand,
  terrestrial: TerrestrialBand,
  human: HumanBand,
};

export function WorldRoot() {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} />
      <directionalLight position={[-8, 5, -6]} intensity={0.3} color="#6688ff" />

      {SPATIAL_BANDS.map((band) => {
        const Component = BAND_COMPONENTS[band.id];
        if (!Component) return null;
        const opacity = getBandOpacity(band, spatialExponent);
        return <Component key={band.id} opacity={opacity} />;
      })}
    </>
  );
}
