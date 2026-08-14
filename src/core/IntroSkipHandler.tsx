import { useEffect } from 'react';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { UNIVERSE_AGE_SECONDS } from '../core/TimeSpace';

/** When intro is skipped, jump to a sensible interactive starting point — once. */
export function IntroSkipHandler() {
  const skipped = useIntroStore((s) => s.skipped);
  const phase = useIntroStore((s) => s.phase);
  const skipObserverApplied = useIntroStore((s) => s.skipObserverApplied);
  const markSkipObserverApplied = useIntroStore((s) => s.markSkipObserverApplied);
  const setSimTime = useObserverStore((s) => s.setSimTime);
  const setSpatialExponent = useObserverStore((s) => s.setSpatialExponent);
  const setTemporalExponent = useObserverStore((s) => s.setTemporalExponent);

  useEffect(() => {
    if (phase !== 'complete' || !skipped || skipObserverApplied) return;
    // Remount/HMR while walking must not yank the player to universe scale.
    if (useObserverStore.getState().mode === 'embodied') {
      markSkipObserverApplied();
      return;
    }
    markSkipObserverApplied();
    setSimTime(UNIVERSE_AGE_SECONDS);
    setSpatialExponent(25);
    setTemporalExponent(0);
  }, [
    phase,
    skipped,
    skipObserverApplied,
    markSkipObserverApplied,
    setSimTime,
    setSpatialExponent,
    setTemporalExponent,
  ]);

  useEffect(() => {
    if (phase !== 'complete' || skipped) return;
    // After intro finishes naturally, begin slow cosmic playback.
    const setPlaybackRate = useObserverStore.getState().setPlaybackRate;
    setPlaybackRate(100);
    const stop = window.setTimeout(() => setPlaybackRate(0), 4000);
    return () => window.clearTimeout(stop);
  }, [phase, skipped]);

  return null;
}

export function useIntroActive(): boolean {
  return useIntroStore((s) => s.phase !== 'complete');
}

export function postIntroSimTime(): number {
  return UNIVERSE_AGE_SECONDS;
}
