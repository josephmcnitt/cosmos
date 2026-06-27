import { sampleTerrainHeight } from '../core/embodiment';
import type { AgeBuildingDef } from '../data/ages/types';

function OliveTree({
  x,
  z,
  scale = 1,
  highlight = false,
}: {
  x: number;
  z: number;
  scale?: number;
  highlight?: boolean;
}) {
  const y = sampleTerrainHeight(x, z);
  const foliageColor = highlight ? '#6a8c48' : '#3d5c34';
  const emissive = highlight ? '#c8e088' : '#000000';
  const emissiveIntensity = highlight ? 0.35 : 0;
  return (
    <group position={[x, y, z]} scale={scale}>
      {highlight && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.9, 1.15, 32]} />
            <meshBasicMaterial color="#d4e8a0" transparent opacity={0.45} depthWrite={false} />
          </mesh>
          <pointLight color="#c8e088" intensity={2.5} distance={10} decay={2} position={[0, 2.2, 0]} />
        </>
      )}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1.2, 6]} />
        <meshStandardMaterial color="#4a3828" roughness={0.95} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 1.6) * 0.35, 1.35 + i * 0.08, Math.cos(i * 1.6) * 0.35]}
        >
          <sphereGeometry args={[0.45 - i * 0.06, 8, 8]} />
          <meshStandardMaterial
            color={foliageColor}
            roughness={0.9}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
      ))}
    </group>
  );
}

function Stoa({ x, z, rotationY = 0, scale = 1 }: { x: number; z: number; rotationY?: number; scale?: number }) {
  const y = sampleTerrainHeight(x, z);
  const columns = [-2.5, -0.8, 0.8, 2.5];
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]} scale={scale}>
      {columns.map((cx) => (
        <mesh key={cx} position={[cx, 0.9, 0]}>
          <boxGeometry args={[0.18, 1.8, 0.18]} />
          <meshStandardMaterial color="#c8c0b0" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[6, 0.12, 2.2]} />
        <meshStandardMaterial color="#a89888" roughness={0.9} />
      </mesh>
    </group>
  );
}

function TempleDistant({ x, z, rotationY = 0, scale = 1 }: { x: number; z: number; rotationY?: number; scale?: number }) {
  const y = sampleTerrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]} scale={scale}>
      {[-1.2, -0.4, 0.4, 1.2].map((cx) => (
        <mesh key={cx} position={[cx, 0.5, 0]}>
          <boxGeometry args={[0.12, 1, 0.12]} />
          <meshStandardMaterial color="#b8b0a0" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.08, 1.6]} />
        <meshStandardMaterial color="#a0a098" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.25, -0.2]}>
        <boxGeometry args={[3.4, 0.5, 0.08]} />
        <meshStandardMaterial color="#989890" roughness={0.92} />
      </mesh>
    </group>
  );
}

function ColumnRow({ x, z, rotationY = 0, scale = 1 }: { x: number; z: number; rotationY?: number; scale?: number }) {
  const y = sampleTerrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]} scale={scale}>
      {Array.from({ length: 7 }, (_, i) => i - 3).map((cx) => (
        <mesh key={cx} position={[cx * 0.55, 0.65, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 1.3, 8]} />
          <meshStandardMaterial color="#d0c8b8" roughness={0.88} />
        </mesh>
      ))}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[4.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#b0a898" roughness={0.9} />
      </mesh>
    </group>
  );
}

function LibraryBlock({ x, z, rotationY = 0, scale = 1 }: { x: number; z: number; rotationY?: number; scale?: number }) {
  const y = sampleTerrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[4, 2.4, 3]} />
        <meshStandardMaterial color="#8a9098" roughness={0.92} />
      </mesh>
      <mesh position={[2.2, 2.8, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#c8a860" roughness={0.85} emissive="#c8a860" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function DesertCave({ x, z, rotationY = 0, scale = 1 }: { x: number; z: number; rotationY?: number; scale?: number }) {
  const y = sampleTerrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[-0.8, 0.7, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.5, 1.6, 0.6]} />
        <meshStandardMaterial color="#6a5848" roughness={0.95} />
      </mesh>
      <mesh position={[0.8, 0.7, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.5, 1.6, 0.6]} />
        <meshStandardMaterial color="#6a5848" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.15, -0.3]}>
        <boxGeometry args={[1.4, 0.3, 0.8]} />
        <meshStandardMaterial color="#5a4838" roughness={1} />
      </mesh>
    </group>
  );
}

function Building({ def }: { def: AgeBuildingDef }) {
  const [x, , z] = def.position;
  const props = { x, z, rotationY: def.rotationY ?? 0, scale: def.scale ?? 1 };
  switch (def.preset) {
    case 'olive-tree':
      return <OliveTree {...props} highlight={def.highlight} />;
    case 'stoa':
      return <Stoa {...props} />;
    case 'temple-distant':
      return <TempleDistant {...props} />;
    case 'column-row':
      return <ColumnRow {...props} />;
    case 'library-block':
      return <LibraryBlock {...props} />;
    case 'desert-cave':
      return <DesertCave {...props} />;
    default:
      return null;
  }
}

export function AgeScenery({ buildings }: { buildings: AgeBuildingDef[] }) {
  return (
    <group>
      {buildings.map((b) => (
        <Building key={b.id} def={b} />
      ))}
    </group>
  );
}
