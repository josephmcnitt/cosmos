import { useEffect } from 'react';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

/** Keeps embodiment in sync when intro completes or era changes. */
export function EmbodimentSync() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const syncEmbodiment = useObserverStore((s) => s.syncEmbodiment);

  useEffect(() => {
    if (!introComplete) return;
    syncEmbodiment();
  }, [introComplete, spatialExponent, simTimeSeconds, syncEmbodiment]);

  return null;
}
