import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useObserverStore } from '../../core/ObserverState';
import { GLOBE_RADIUS } from './EarthGlobe';

export function EarthOrbitControls() {
  const setEarthRotation = useObserverStore((s) => s.setEarthRotation);
  const adjustEarthOrbitDistance = useObserverStore((s) => s.adjustEarthOrbitDistance);
  const earthRotation = useObserverStore((s) => s.earthRotation);
  const { gl, camera } = useThree();

  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(earthRotation);

  useEffect(() => {
    rotationRef.current = earthRotation;
  }, [earthRotation]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      const { yaw, pitch } = rotationRef.current;
      setEarthRotation(yaw - dx * 0.005, pitch + dy * 0.005);
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      adjustEarthOrbitDistance(-e.deltaY * 0.002);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl.domElement, setEarthRotation, adjustEarthOrbitDistance, camera]);

  return null;
}

/** Click empty globe surface to clear selection (handled via miss on pins). */
export function EarthGlobeBackdrop() {
  return (
    <mesh
      onClick={() => useObserverStore.getState().clearGeoFocus()}
      scale={GLOBE_RADIUS * 1.001}
    >
      <sphereGeometry args={[1, 32, 24]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}
