import { useLayoutEffect } from 'react';
import { isEarthAutoEnterEnabled } from './feature';
import { useIntroStore } from '../IntroState';
import { useObserverStore } from '../ObserverState';
import { getSpatialBand } from '../ScaleSpace';

/** Auto-enter globe when zoomed to planetary scale (cosmic preview is not interactive). */
export function EarthModeSync() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const enterEarthMode = useObserverStore((s) => s.enterEarthMode);

  useLayoutEffect(() => {
    if (!introComplete || !isEarthAutoEnterEnabled()) return;
    if (mode !== 'cosmic') return;
    const bandId = getSpatialBand(spatialExponent).id;
    if (bandId === 'planetary') {
      enterEarthMode();
    }
  }, [introComplete, mode, spatialExponent, enterEarthMode]);

  return null;
}
