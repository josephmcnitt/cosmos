import { useEffect } from 'react';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { UNIVERSE_AGE_SECONDS } from '../core/TimeSpace';

/** When intro is skipped, jump to a sensible interactive starting point. */
export function IntroSkipHandler() {
  const skipped = useIntroStore((s) => s.skipped);
  const phase = useIntroStore((s) => s.phase);
  const setSimTime = useObserverStore((s) => s.setSimTime);
  const setSpatialExponent = useObserverStore((s) => s.setSpatialExponent);
  const setTemporalExponent = useObserverStore((s) => s.setTemporalExponent);

  useEffect(() => {
    if (phase !== 'complete' || !skipped) return;
    setSimTime(UNIVERSE_AGE_SECONDS);
    setSpatialExponent(25);
    setTemporalExponent(0);
  }, [phase, skipped, setSimTime, setSpatialExponent, setTemporalExponent]);

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
