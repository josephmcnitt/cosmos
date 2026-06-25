import { useMemo } from 'react';
import { isCorrespondenceLensActive } from '../core/traditionGates';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';

export function CorrespondenceIndicator() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const mode = useObserverStore((s) => s.mode);
  const spiritualDepth = usePracticeStore((s) => s.spiritualDepth);
  const sessionsCompleted = usePracticeStore((s) => s.sessionsCompleted);
  const dominantTradition = usePracticeStore((s) => s.dominantTradition);

  const active = useMemo(
    () =>
      isCorrespondenceLensActive({
        spiritualDepth,
        sessionsCompleted,
        simTimeSeconds,
        spatialExponent,
        mode,
        introComplete,
        dominantTradition,
      }),
    [
      spiritualDepth,
      sessionsCompleted,
      simTimeSeconds,
      spatialExponent,
      mode,
      introComplete,
      dominantTradition,
    ],
  );

  if (!introComplete || mode !== 'cosmic') return null;

  return (
    <span
      data-testid="correspondence-active"
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
