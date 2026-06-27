import { useEffect } from 'react';
import { worldEvents } from '../world/WorldEvents';
import { useWorldStore } from '../world/WorldState';

const PROGRESS_EVENTS = new Set([
  'initiation/completed',
  'puzzle/completed',
  'entity/discovered',
  'world/traveled',
]);

/** Re-evaluates progression graph when world facts change. */
export function ProgressionSync() {
  const hydrated = useWorldStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    const run = () => useWorldStore.getState().reevaluateProgress();

    const unsub = worldEvents.subscribe((event) => {
      if (PROGRESS_EVENTS.has(event.type)) {
        run();
      }
    });

    run();
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const unsub = useWorldStore.subscribe((state, prev) => {
      if (!state.hydrated) return;
      if (
        state.resonance !== prev.resonance ||
        state.sessionsCompleted !== prev.sessionsCompleted ||
        state.choiceHistory !== prev.choiceHistory
      ) {
        useWorldStore.getState().reevaluateProgress();
      }
    });
    return unsub;
  }, [hydrated]);

  return null;
}
