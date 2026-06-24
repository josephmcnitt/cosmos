import { useMemo } from 'react';
import * as THREE from 'three';
import { sampleTerrainHeight } from '../core/embodiment';
import { getEventById } from '../data/history/index';
import {
  MARKER_TRADITION_COLORS,
  SITE_MARKERS,
} from '../data/embodied/siteMarkers';

function Terrain() {
  const geometry = useMemo(() => {
    const size = 40;
    const segments = 48;
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
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#2d5a3d" roughness={0.95} />
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
}: {
  position: [number, number, number];
  color?: string;
}) {
  const y = sampleTerrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 1, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </group>
  );
}

export function EmbodiedSite() {
  return (
    <group>
      <Terrain />
      <PathStrip width={2.2} length={28} position={[0, 0.03, 0]} />
      <PathStrip width={2.2} length={22} position={[0, 0.03, 0]} rotationY={Math.PI / 2} />
      <Bench position={[-4, 0, 3]} />
      {SITE_MARKERS.map((marker) => {
        const event = getEventById(marker.eventId);
        const color =
          event?.track === 'spiritual'
            ? MARKER_TRADITION_COLORS[event.tradition]
            : '#8899aa';
        return (
          <MarkerStone
            key={marker.eventId}
            position={[marker.position[0], 0, marker.position[1]]}
            color={color}
          />
        );
      })}
    </group>
  );
}
