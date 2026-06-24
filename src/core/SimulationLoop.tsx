import { useFrame } from '@react-three/fiber';
import { useObserverStore } from '../core/ObserverState';

/** Advances simulation clock each frame when playback is active. */
export function SimulationLoop() {
  const tick = useObserverStore((s) => s.tick);

  useFrame(() => {
    tick();
  });

  return null;
}
