import { useMemo } from 'react';
import { sampleTerrainHeight } from '../core/embodiment';
import { useWorldStore } from '../core/world/WorldState';

export function AstralStructures({ worldId }: { worldId: string }) {
  const entities = useWorldStore((s) => s.entities);
  const structures = useMemo(
    () =>
      entities.filter(
        (e) => e.worldId === worldId && e.kind === 'structure' && e.layer === 'esoteric',
      ),
    [entities, worldId],
  );

  return (
    <group>
      {structures.map((s) => {
        const y = sampleTerrainHeight(s.transform.x, s.transform.z);
        const progress = (s.state.progress as number) ?? 0;
        const complete = s.state.complete === true;
        return (
          <group key={s.id} position={[s.transform.x, y, s.transform.z]}>
            <mesh position={[0, 0.6, 0]}>
              <octahedronGeometry args={[0.4 + progress * 0.2, 0]} />
              <meshStandardMaterial
                color={complete ? '#d4a843' : '#7868a8'}
                emissive={complete ? '#a88830' : '#483868'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.7 + progress * 0.3}
              />
            </mesh>
            {!complete && (
              <mesh position={[0, 0.1, 0]}>
                <ringGeometry args={[0.3, 0.5, 16]} />
                <meshStandardMaterial color="#4ecdc4" transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
