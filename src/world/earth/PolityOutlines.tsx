import { useMemo } from 'react';
import * as THREE from 'three';
import { useObserverStore } from '../../core/ObserverState';
import { lngLatRingToSpherePoints } from '../../core/earth/spherePolygon';
import { getPolitiesAtTime } from '../../data/earth';
import type { ResolvedPolity } from '../../data/earth/types';
import { GLOBE_RADIUS } from './EarthGlobe';

const SURFACE_OFFSET = 1.002;

function ringToLinePoints(ring: [number, number][], radius: number): THREE.Vector3[] {
  const pts = lngLatRingToSpherePoints(ring, radius, SURFACE_OFFSET);
  if (ring.length > 0) {
    pts.push(pts[0]!.clone());
  }
  return pts;
}

function PolityRing({ ring, color }: { ring: [number, number][]; color: string }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      ringToLinePoints(ring, GLOBE_RADIUS),
    );
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
    });
    return new THREE.Line(geometry, material);
  }, [ring, color]);

  return <primitive object={line} />;
}

export function PolityOutlines() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const polities = useMemo(
    () => getPolitiesAtTime(simTimeSeconds),
    [simTimeSeconds],
  );

  return (
    <group name="polity-outlines">
      {polities.map((polity: ResolvedPolity) =>
        polity.rings.map((ring: [number, number][], ringIdx: number) =>
          ring.length >= 3 ? (
            <PolityRing key={`${polity.polityId}-${ringIdx}`} ring={ring} color={polity.color} />
          ) : null,
        ),
      )}
    </group>
  );
}
