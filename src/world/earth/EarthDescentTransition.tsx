import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EMBODIED_ENTER_EXPONENT, embodimentApproachWeight } from '../../core/embodiment';
import { latLngToSphereUnit } from '../../core/earth/geo';
import {
  EARTH_ORBIT_DISTANCE_MIN,
  type GeoFocus,
} from '../../core/earth/earthMode';
import { useObserverStore } from '../../core/ObserverState';
import { EmbodiedSite } from '../EmbodiedSite';
import { GLOBE_RADIUS } from './EarthGlobe';

export const DESCENT_DURATION = 1.85;

function yawPitchFromUnit(v: THREE.Vector3): { yaw: number; pitch: number } {
  const n = v.clone().normalize();
  const pitch = Math.asin(Math.max(-1, Math.min(1, n.y)));
  const yaw = Math.atan2(n.x, n.z);
  return { yaw, pitch };
}

function EarthDescentCamera({
  geoFocus,
  startDistance,
  startRotation,
}: {
  geoFocus: GeoFocus;
  startDistance: number;
  startRotation: { yaw: number; pitch: number };
}) {
  const completeEarthDescent = useObserverStore((s) => s.completeEarthDescent);
  const { camera } = useThree();
  const progress = useRef(0);
  const completed = useRef(false);
  const lookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    progress.current = 0;
    completed.current = false;
  }, [geoFocus.siteAnchorId, geoFocus.lat, geoFocus.lng]);

  useFrame((_, delta) => {
    if (completed.current) return;

    progress.current = Math.min(1, progress.current + delta / DESCENT_DURATION);
    const t = 1 - Math.pow(1 - progress.current, 2.2);
    const focusUnit = latLngToSphereUnit(geoFocus.lat, geoFocus.lng);
    const targetRot = yawPitchFromUnit(focusUnit);
    const yaw = THREE.MathUtils.lerp(startRotation.yaw, targetRot.yaw, t);
    const pitch = THREE.MathUtils.lerp(startRotation.pitch, targetRot.pitch, t);
    const dist = THREE.MathUtils.lerp(startDistance, EARTH_ORBIT_DISTANCE_MIN, t);

    const cosP = Math.cos(pitch);
    camera.position.set(
      dist * Math.sin(yaw) * cosP,
      dist * Math.sin(pitch),
      dist * Math.cos(yaw) * cosP,
    );
    lookAt.current.copy(focusUnit).multiplyScalar(GLOBE_RADIUS * 0.35);
    camera.lookAt(lookAt.current);

    useObserverStore.getState().setEarthRotation(yaw, pitch);

    if (progress.current >= 1 && !completed.current) {
      completed.current = true;
      completeEarthDescent();
    }
  });

  return null;
}

/** Globe dive toward geoFocus, terrain approach, then walk mode. */
export function EarthDescentTransition() {
  const earthPhase = useObserverStore((s) => s.earthPhase);
  const geoFocus = useObserverStore((s) => s.geoFocus);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const startSnapshot = useRef({
    distance: EARTH_ORBIT_DISTANCE_MIN,
    rotation: { yaw: 0, pitch: 0.35 },
  });
  const progress = useRef(0);

  useEffect(() => {
    if (earthPhase !== 'descent' || !geoFocus) return;
    const state = useObserverStore.getState();
    startSnapshot.current = {
      distance: state.earthOrbitDistance,
      rotation: { ...state.earthRotation },
    };
    progress.current = 0;
  }, [earthPhase, geoFocus?.siteAnchorId]);

  useFrame((_, delta) => {
    if (earthPhase !== 'descent') {
      progress.current = 0;
      return;
    }
    progress.current = Math.min(1, progress.current + delta / DESCENT_DURATION);
  });

  if (earthPhase !== 'descent' || !geoFocus) return null;

  const terrainWeight = Math.max(0, (progress.current - 0.35) / 0.65);
  const globeFade = 1 - Math.min(1, progress.current * 1.15);
  const approachT = embodimentApproachWeight(
    THREE.MathUtils.lerp(spatialExponent, EMBODIED_ENTER_EXPONENT, progress.current),
  );

  return (
    <>
      <EarthDescentCamera
        geoFocus={geoFocus}
        startDistance={startSnapshot.current.distance}
        startRotation={startSnapshot.current.rotation}
      />
      <group scale={0.08 + terrainWeight * 0.92}>
        <EmbodiedSite />
      </group>
      <ambientLight intensity={0.35 + terrainWeight * 0.25} />
      <directionalLight position={[8, 16, 6]} intensity={0.4 + terrainWeight * 0.7} />
      <mesh renderOrder={20}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.02, 32, 24]} />
        <meshBasicMaterial
          transparent
          opacity={globeFade * 0.35}
          color="#030508"
          depthWrite={false}
        />
      </mesh>
      {approachT > 0.02 && null}
    </>
  );
}
