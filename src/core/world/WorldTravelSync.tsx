import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { getActiveAgeDefinition } from './WorldRegistry';
import { useWorldStore } from './WorldState';
import { useObserverStore } from '../ObserverState';

/** Snap timeline and avatar when traveling between ages. */
export function WorldTravelSync() {
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const ageTransitionActive = useWorldStore((s) => s.ageTransitionActive);
  const prevWorldId = useRef(currentWorldId);

  useEffect(() => {
    if (prevWorldId.current === currentWorldId) return;
    prevWorldId.current = currentWorldId;

    const age = getActiveAgeDefinition(currentWorldId);
    const observer = useObserverStore.getState();
    observer.setSimTime(age.simTimeSeconds);
    observer.moveAvatar(new Vector3(age.spawn.position[0], 0, age.spawn.position[1]));
    observer.setAvatarYaw(age.spawn.yaw);
  }, [currentWorldId]);

  if (!ageTransitionActive) return null;

  return (
    <div className="age-transition-overlay" data-testid="age-transition" aria-hidden />
  );
}
