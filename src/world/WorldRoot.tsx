import { useMemo, type ComponentType } from 'react';
import * as THREE from 'three';
import {
  bandEnterScale,
  getBandOpacity,
  sceneDistanceFromExponent,
  SPATIAL_BANDS,
} from '../core/ScaleSpace';
import { sampleTerrainHeight } from '../core/embodiment';
import { useObserverStore } from '../core/ObserverState';

function UniverseBand({ opacity }: { opacity: number; starSize?: number }) {
  if (opacity <= 0.01) return null;
  return null;
}

function GalaxyBand({ opacity, scale = 1 }: { opacity: number; starSize?: number; scale?: number }) {
  if (opacity <= 0.01) return null;

  return (
    <group scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 22, 64]} />
        <meshBasicMaterial
          color="#8a9eff"
          transparent
          opacity={opacity * 0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}

function StellarBand({ opacity, scale = 1 }: { opacity: number; scale?: number }) {
  if (opacity <= 0.01) return null;

  return (
    <group scale={scale}>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#fff4c2" transparent opacity={opacity} toneMapped={false} fog={false} />
      </mesh>
      <mesh scale={[3, 3, 3]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color="#ff8844"
          transparent
          opacity={opacity * 0.12}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh position={[4, 0.5, -2]} scale={0.15}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#aaccff" transparent opacity={opacity * 0.7} fog={false} />
      </mesh>
    </group>
  );
}

function PlanetaryBand({ opacity, scale = 1 }: { opacity: number; scale?: number }) {
  if (opacity <= 0.01) return null;

  return (
    <group scale={scale}>
      <mesh>
        <sphereGeometry args={[2.5, 48, 48]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.85}
          metalness={0.05}
          transparent
          opacity={opacity}
          fog={false}
        />
      </mesh>
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#7ec8ff"
          transparent
          opacity={opacity * 0.15}
          depthWrite={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}

function TerrestrialBand({ opacity, scale = 1 }: { opacity: number; scale?: number }) {
  const geometry = useMemo(() => {
    const size = 48;
    const segments = 40;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, sampleTerrainHeight(x, z) - 0.5);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <group scale={scale}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#2d5a3d"
          roughness={0.95}
          transparent
          opacity={opacity}
          fog={false}
        />
      </mesh>
    </group>
  );
}

function HumanBand({ opacity, scale = 1 }: { opacity: number; scale?: number }) {
  if (opacity <= 0.01) return null;

  return (
    <group scale={scale} position={[0, 0.9, 0]}>
      <mesh>
        <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
        <meshStandardMaterial
          color="#e8c4a0"
          roughness={0.7}
          transparent
          opacity={opacity}
          fog={false}
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
          fog={false}
        />
      </mesh>
    </group>
  );
}

const BAND_COMPONENTS: Record<
  string,
  ComponentType<{ opacity: number; starSize?: number; scale?: number }>
> = {
  universe: UniverseBand,
  galaxy: GalaxyBand,
  stellar: StellarBand,
  planetary: PlanetaryBand,
  terrestrial: TerrestrialBand,
  human: HumanBand,
};

export interface HeavenModifiers {
  bandScale?: Partial<Record<string, number>>;
  ambientScale?: number;
}

export function WorldRoot({ modifiers }: { modifiers?: HeavenModifiers }) {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const camDist = sceneDistanceFromExponent(spatialExponent);
  const bodyScale = Math.max(1, camDist / 28);

  return (
    <>
      {SPATIAL_BANDS.map((band) => {
        const Component = BAND_COMPONENTS[band.id];
        if (!Component) return null;
        const base = getBandOpacity(band, spatialExponent);
        const heavenScale = modifiers?.bandScale?.[band.id] ?? 1;
        const opacity = base * heavenScale;
        if (opacity <= 0.01) return null;

        const enterScale = bandEnterScale(band, spatialExponent);
        let meshScale = enterScale;
        if (band.id === 'stellar' || band.id === 'planetary') {
          meshScale = bodyScale * enterScale;
        } else if (band.id === 'terrestrial') {
          meshScale = Math.max(1, camDist / 12) * enterScale;
        }

        return <Component key={band.id} opacity={opacity} scale={meshScale} />;
      })}
    </>
  );
}
