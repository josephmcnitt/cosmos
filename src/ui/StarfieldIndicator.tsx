import { useMemo } from 'react';
import { computeHeavenVisuals } from '../core/materialHeavens';
import { starfieldBrightness } from '../core/heavenVisibility';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

export function StarfieldIndicator() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);

  const brightness = useMemo(() => {
    const { starfieldOpacity } = computeHeavenVisuals(simTimeSeconds);
    return starfieldBrightness(starfieldOpacity);
  }, [simTimeSeconds]);

  if (!introComplete || mode !== 'cosmic') return null;

  return (
    <span
      data-testid="starfield-brightness"
      data-brightness={brightness.toFixed(4)}
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
