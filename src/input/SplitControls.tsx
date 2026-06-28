import { useEffect, useMemo, useRef, useState } from 'react';
import { performSplit, rejoinSplit } from '../core/astral/AstralAgent';
import {
  canPerformSplit,
  nextSplitRequirement,
  showSplitPrep,
} from '../core/splitReadiness';
import { useIntroActive } from '../core/IntroSkipHandler';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';
import { useWorldStore } from '../core/world/WorldState';

const SPLIT_HOLD_SEC = 12;

export function SplitControls() {
  const introActive = useIntroActive();
  const mode = useObserverStore((s) => s.mode);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const realmPhase = usePracticeStore((s) => s.realmPhase);
  const sustainElapsedSec = usePracticeStore((s) => s.sustainElapsedSec);
  const spiritualDepth = useWorldStore((s) => s.spiritualDepth);
  const sessionsCompleted = useWorldStore((s) => s.sessionsCompleted);
  const dominantTradition = useWorldStore((s) => s.dominantTradition);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const worldLayer = useWorldStore((s) => s.getWorldLayer(currentWorldId));
  const entanglements = useWorldStore((s) => s.entanglements);
  const initiated = useWorldStore((s) => s.isAgeInitiated(currentWorldId));
  const [splitProgress, setSplitProgress] = useState(0);
  const [jFeedback, setJFeedback] = useState<string | null>(null);
  const jHeld = useRef(false);
  const splitStart = useRef<number | null>(null);

  const readinessCtx = useMemo(
    () => ({
      mode,
      initiated,
      worldLayer,
      realmPhase,
      sustainElapsedSec,
      spiritualDepth,
      sessionsCompleted,
      simTimeSeconds,
      spatialExponent,
      dominantTradition,
      entanglementsCount: entanglements.length,
    }),
    [
      mode,
      initiated,
      worldLayer,
      realmPhase,
      sustainElapsedSec,
      spiritualDepth,
      sessionsCompleted,
      simTimeSeconds,
      spatialExponent,
      dominantTradition,
      entanglements.length,
    ],
  );

  const canSplit = canPerformSplit(readinessCtx);
  const visible = showSplitPrep(readinessCtx);
  const nextRequirement = nextSplitRequirement(readinessCtx);

  useEffect(() => {
    if (introActive || mode !== 'embodied') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'j' || e.repeat) return;
      jHeld.current = true;
      if (canSplit) {
        splitStart.current = performance.now();
        setJFeedback(null);
      } else {
        const next = nextSplitRequirement(readinessCtx);
        setJFeedback(next ? `Not ready — ${next.label}` : 'Split not available yet');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'j') return;
      jHeld.current = false;
      splitStart.current = null;
      setSplitProgress(0);
      setJFeedback(null);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [introActive, mode, canSplit, readinessCtx]);

  useEffect(() => {
    if (!jHeld.current || !canSplit || splitStart.current === null) return;
    let raf = 0;
    const tick = () => {
      const elapsed = (performance.now() - splitStart.current!) / 1000;
      const progress = Math.min(1, elapsed / SPLIT_HOLD_SEC);
      setSplitProgress(progress);
      if (progress >= 1) {
        performSplit(currentWorldId, [{ kindId: 'correspondence-node', x: 2, z: -2 }]);
        useWorldStore.getState().setWorldLayer(currentWorldId, 'material');
        jHeld.current = false;
        splitStart.current = null;
        setSplitProgress(0);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canSplit, currentWorldId]);

  useEffect(() => {
    if (introActive || mode !== 'embodied') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'k') return;
      const pair = entanglements[0];
      if (pair) rejoinSplit(pair.id);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [introActive, mode, entanglements]);

  if (!visible && !jFeedback) return null;

  if (!visible) {
    return (
      <div className="split-controls ui-panel" data-testid="split-j-feedback-only">
        <p className="split-j-feedback" data-testid="split-j-feedback">
          {jFeedback}
        </p>
      </div>
    );
  }

  return (
    <div className="split-controls ui-panel" data-testid="split-controls">
      {entanglements.length > 0 ? (
        <p>Astral self active — press K to rejoin.</p>
      ) : canSplit ? (
        <>
          <p>Hold J — astral split</p>
          {splitProgress > 0 && (
            <div className="split-progress" data-testid="split-progress">
              {Math.round(splitProgress * 100)}%
            </div>
          )}
        </>
      ) : (
        <>
          <p>Hold J when ready — astral split</p>
          {nextRequirement && (
            <p className="split-next-req" data-testid="split-next-req">
              Next: {nextRequirement.label}
            </p>
          )}
        </>
      )}
      {jFeedback && (
        <p className="split-j-feedback" data-testid="split-j-feedback">
          {jFeedback}
        </p>
      )}
    </div>
  );
}

export function useSplitReadyForPrompt(): boolean {
  const mode = useObserverStore((s) => s.mode);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const realmPhase = usePracticeStore((s) => s.realmPhase);
  const sustainElapsedSec = usePracticeStore((s) => s.sustainElapsedSec);
  const spiritualDepth = useWorldStore((s) => s.spiritualDepth);
  const sessionsCompleted = useWorldStore((s) => s.sessionsCompleted);
  const dominantTradition = useWorldStore((s) => s.dominantTradition);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const worldLayer = useWorldStore((s) => s.getWorldLayer(currentWorldId));
  const entanglements = useWorldStore((s) => s.entanglements);
  const initiated = useWorldStore((s) => s.isAgeInitiated(currentWorldId));

  return canPerformSplit({
    mode,
    initiated,
    worldLayer,
    realmPhase,
    sustainElapsedSec,
    spiritualDepth,
    sessionsCompleted,
    simTimeSeconds,
    spatialExponent,
    dominantTradition,
    entanglementsCount: entanglements.length,
  });
}
