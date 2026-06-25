import { useMemo } from 'react';
import { isEphemerisBand } from '../core/heavenVisibility';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

export function EphemerisIndicator() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);

  const active = useMemo(
    () => isEphemerisBand(simTimeSeconds, spatialExponent, mode, introComplete),
    [simTimeSeconds, spatialExponent, mode, introComplete],
  );

  if (!introComplete || mode !== 'cosmic') return null;

  return (
    <span
      data-testid="ephemeris-active"
      data-active={active ? 'true' : 'false'}
      aria-hidden
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  );
}
