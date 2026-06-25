import { sampleTerrainHeight } from '../core/embodiment';
import type { EntityInstance } from '../core/world/types';

export function VeilPoint({ entity }: { entity: EntityInstance }) {
  const y = sampleTerrainHeight(entity.transform.x, entity.transform.z);
  return (
    <group position={[entity.transform.x, y, entity.transform.z]}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.15, 6]} />
        <meshStandardMaterial color="#7868a8" emissive="#483878" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#c8b8e8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
