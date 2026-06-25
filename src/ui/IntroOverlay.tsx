import { useEffect, useRef } from 'react';
import {
  INTRO_EXPANSION_MS,
  INTRO_IGNITION_MS,
  INTRO_REVEAL_MS,
  INTRO_VOID_MS,
  introOverlayOpacity,
  useIntroStore,
} from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

export function IntroOverlay() {
  const phase = useIntroStore((s) => s.phase);
  const start = useIntroStore((s) => s.start);
  const setPhase = useIntroStore((s) => s.setPhase);
  const skip = useIntroStore((s) => s.skip);
  const complete = useIntroStore((s) => s.complete);
  const setSimTime = useObserverStore((s) => s.setSimTime);
  const setSpatialExponent = useObserverStore((s) => s.setSpatialExponent);
  const setTemporalExponent = useObserverStore((s) => s.setTemporalExponent);
  const setPlaybackRate = useObserverStore((s) => s.setPlaybackRate);

  const phaseStart = useRef(performance.now());
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    start();
    setSimTime(0.001);
    setSpatialExponent(25);
    setTemporalExponent(0);
    setPlaybackRate(0);
  }, [start, setSimTime, setSpatialExponent, setTemporalExponent, setPlaybackRate]);

  useEffect(() => {
    phaseStart.current = performance.now();

    if (phase === 'void') {
      const timer = window.setTimeout(() => setPhase('ignition'), INTRO_VOID_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === 'ignition') {
      const timer = window.setTimeout(() => setPhase('expansion'), INTRO_IGNITION_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === 'expansion') {
      const timer = window.setTimeout(() => setPhase('reveal'), INTRO_EXPANSION_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === 'reveal') {
      const timer = window.setTimeout(() => complete(), INTRO_REVEAL_MS);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [phase, setPhase, complete]);

  useEffect(() => {
    const tick = () => {
      const elapsed = performance.now() - phaseStart.current;
      const opacity = introOverlayOpacity(phase, elapsed);
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(opacity);
      }
      if (phase !== 'complete') rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    const onKey = () => {
      if (phase !== 'complete') skip();
    };
    const onClick = () => {
      if (phase !== 'complete') skip();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
    };
  }, [phase, skip]);

  if (phase === 'complete') return null;

  return (
    <div
      ref={overlayRef}
      className="intro-overlay"
      data-testid="intro-overlay"
      aria-hidden={phase === 'reveal'}
    >
      {phase === 'void' && (
        <div className="intro-void">
          <span className="intro-pulse" />
        </div>
      )}
      {(phase === 'ignition' || phase === 'expansion') && (
        <div className="intro-caption">From the center of everything…</div>
      )}
      <div className="intro-skip" data-testid="intro-skip">Click or press any key to skip</div>
    </div>
  );
}
