import { useEffect } from 'react';
import { bootstrapSimInstances } from './WorldSimSync';
import { useWorldStore } from './WorldState';

/** Load persisted world state on boot. */
export function WorldBootstrap() {
  useEffect(() => {
    useWorldStore.getState().hydrate();
    useWorldStore.getState().reevaluateProgress();
    bootstrapSimInstances();

    const persistInterval = setInterval(() => {
      useWorldStore.getState().persist();
    }, 5_000);

    return () => clearInterval(persistInterval);
  }, []);

  return null;
}
