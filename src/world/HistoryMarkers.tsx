import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getEventsWith3DMarkers, isEventAtVisibleScale } from '../data/history/index';
import { flyToEvent } from '../core/flyToEvent';
import { isEarthGlobeEnabled } from '../core/earth/feature';
import { getSpatialBand } from '../core/ScaleSpace';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';

const LOG_TIME_WINDOW = 0.2;

function isTimeNear(eventTime: number, simTime: number): boolean {
  const logDiff = Math.abs(
    Math.log10(Math.max(eventTime, 1)) - Math.log10(Math.max(simTime, 1)),
  );
  return logDiff < LOG_TIME_WINDOW;
}

function HistoryPin({
  event,
  visible,
}: {
  event: ReturnType<typeof getEventsWith3DMarkers>[0];
  visible: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (!meshRef.current || !visible) return;
    meshRef.current.rotation.y += delta * 0.5;
  });

  if (!visible) return null;

  return (
    <mesh
      ref={meshRef}
      position={[0, 1.2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (useHistoryStore.getState().isFlying) return;
        void flyToEvent(event);
      }}
    >
      <octahedronGeometry args={[0.35, 0]} />
      <meshBasicMaterial color="#ffdd88" transparent opacity={0.9} />
    </mesh>
  );
}

export function HistoryMarkers() {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const mode = useObserverStore((s) => s.mode);
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);

  const markers = useMemo(() => getEventsWith3DMarkers(), []);

  // Skip 3D pins at universe/galaxy scale — keeps the starfield render path light.
  if (spatialExponent >= 22) return null;

  const bandId = getSpatialBand(spatialExponent).id;
  if (
    isEarthGlobeEnabled() &&
    mode === 'cosmic' &&
    (bandId === 'planetary' || bandId === 'terrestrial')
  ) {
    return null;
  }

  return (
    <group>
      {markers.map((event) => {
        const timeNear =
          isTimeNear(event.simTimeSeconds, simTimeSeconds) ||
          event.id === selectedEventId;
        const scaleOk = isEventAtVisibleScale(event, spatialExponent);
        const visible = timeNear && scaleOk;
        return <HistoryPin key={event.id} event={event} visible={visible} />;
      })}
    </group>
  );
}
