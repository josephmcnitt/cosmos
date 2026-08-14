import { useEffect } from 'react';
import { useHistoryStore } from './HistoryState';
import { useObserverStore } from './ObserverState';
import { usePracticeStore } from './PracticeState';
import { useWorldStore } from './world/WorldState';

/**
 * Dev-only bridge exposing zustand stores on window.__cosmos for the agent
 * playtest and console debugging. Absent from production builds.
 */
export function DevStoreBridge() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w.__cosmos = {
      observer: useObserverStore,
      world: useWorldStore,
      practice: usePracticeStore,
      history: useHistoryStore,
    };
    return () => {
      delete w.__cosmos;
    };
  }, []);
  return null;
}
