import { useFrame } from '@react-three/fiber';
import { useObserverStore } from '../core/ObserverState';
import { tickWorldSim } from '../core/world/WorldSimSync';

/** Advances simulation clock and world instance sim each frame. */
export function SimulationLoop() {
  const tick = useObserverStore((s) => s.tick);

  useFrame(() => {
    tick();
    tickWorldSim(performance.now());
  });

  return null;
}
