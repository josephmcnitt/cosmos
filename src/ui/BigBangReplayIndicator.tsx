import { useMemo } from 'react';
import { isBigBangReplayActive } from '../core/bigBangReplay';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

export function BigBangReplayIndicator() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);

  const active = useMemo(
    () => isBigBangReplayActive(simTimeSeconds, mode, introComplete),
    [simTimeSeconds, mode, introComplete],
  );

  if (!introComplete || mode !== 'cosmic') return null;

  return (
    <span
      data-testid="bigbang-replay-active"
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
