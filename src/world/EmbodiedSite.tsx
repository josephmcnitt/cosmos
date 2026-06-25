import { useMemo } from 'react';
import * as THREE from 'three';
import { sampleTerrainHeight } from '../core/embodiment';
import { getEventById } from '../data/history/index';
import { MARKER_TRADITION_COLORS } from '../data/embodied/siteMarkers';
import { getActiveAgeDefinition } from '../core/world/WorldRegistry';
import { useWorldStore } from '../core/world/WorldState';
import { CorrespondencePortal } from './CorrespondencePortal';
import { VeilPoint } from './VeilPoint';
import { PuzzleMechanism } from './PuzzleMechanism';
import { AstralStructures } from './AstralStructures';

function Terrain({ color, size, segments }: { color: string; size: number; segments: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, sampleTerrainHeight(x, z));
    }
    geo.computeVertexNormals();
    return geo;
  }, [size, segments]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function PathStrip({
  width,
  length,
  position,
  rotationY = 0,
}: {
  width: number;
  length: number;
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[width, 0.06, length]} />
      <meshStandardMaterial color="#3a4a38" roughness={1} />
    </mesh>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  const y = sampleTerrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.4]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, -0.15]}>
        <boxGeometry args={[1.2, 0.24, 0.08]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </mesh>
      <mesh position={[-0.45, 0.12, 0.1]}>
        <boxGeometry args={[0.08, 0.24, 0.35]} />
        <meshStandardMaterial color="#4a3528" roughness={0.9} />
      </mesh>
      <mesh position={[0.45, 0.12, 0.1]}>
        <boxGeometry args={[0.08, 0.24, 0.35]} />
        <meshStandardMaterial color="#4a3528" roughness={0.9} />
      </mesh>
    </group>
  );
}

function MarkerStone({
  position,
  color = '#8899aa',
  discovered = false,
}: {
  position: [number, number, number];
  color?: string;
  discovered?: boolean;
}) {
  const y = sampleTerrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 1, 0.25]} />
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          emissive={discovered ? color : '#000000'}
          emissiveIntensity={discovered ? 0.15 : 0}
        />
      </mesh>
    </group>
  );
}

export function EmbodiedSite() {
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const worldLayer = useWorldStore((s) => s.worldLayers[s.currentWorldId] ?? 'material');
  const entities = useWorldStore((s) => s.entities);
  const discoveredEventIds = useWorldStore((s) => s.discoveredEventIds);

  const age = getActiveAgeDefinition(currentWorldId);
  const layer = worldLayer;

  const markers = entities.filter(
    (e) => e.worldId === currentWorldId && e.kind === 'marker' && e.layer === 'material',
  );
  const portals = entities.filter(
    (e) => e.worldId === currentWorldId && e.kind === 'portal',
  );
  const veils = entities.filter(
    (e) => e.worldId === currentWorldId && e.kind === 'veil',
  );
  const puzzles = entities.filter(
    (e) => e.worldId === currentWorldId && e.kind === 'puzzle-mechanism',
  );

  const showMaterial = layer === 'material';
  const showEsoteric = layer === 'esoteric';

  return (
    <group>
      <Terrain
        color={age.terrain.color}
        size={age.terrain.size}
        segments={age.terrain.segments}
      />
      {showMaterial && (
        <>
          {age.paths.map((p, i) => (
            <PathStrip
              key={`path-${i}`}
              width={p.width}
              length={p.length}
              position={p.position}
              rotationY={p.rotationY}
            />
          ))}
          {age.benches.map((b, i) => (
            <Bench key={`bench-${i}`} position={b.position} />
          ))}
          {markers.map((m) => {
            const event = getEventById(m.defId);
            const color =
              event?.track === 'spiritual'
                ? MARKER_TRADITION_COLORS[event.tradition]
                : '#8899aa';
            return (
              <MarkerStone
                key={m.id}
                position={[m.transform.x, 0, m.transform.z]}
                color={color}
                discovered={discoveredEventIds.includes(m.defId)}
              />
            );
          })}
          {portals
            .filter((p) => p.state.unlocked === true)
            .map((p) => (
              <CorrespondencePortal key={p.id} entity={p} />
            ))}
          {puzzles.map((p) => (
            <PuzzleMechanism key={p.id} entity={p} />
          ))}
        </>
      )}
      {veils.map((v) => (
        <VeilPoint key={v.id} entity={v} />
      ))}
      {showEsoteric && <AstralStructures worldId={currentWorldId} />}
    </group>
  );
}
