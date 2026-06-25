import { useEffect, useRef, useState } from 'react';
import { meetsTraditionGate } from '../core/traditionGates';
import { performSplit, rejoinSplit } from '../core/astral/AstralAgent';
import { useIntroActive } from '../core/IntroSkipHandler';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';
import { useWorldStore } from '../core/world/WorldState';
import { SPIRITUAL_SUSTAIN_SEC } from '../core/practice';

const SPLIT_HOLD_SEC = 18;

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
  const [splitProgress, setSplitProgress] = useState(0);
  const jHeld = useRef(false);
  const splitStart = useRef<number | null>(null);

  const canSplit =
    mode === 'embodied' &&
    worldLayer === 'esoteric' &&
    realmPhase === 'spiritual' &&
    sustainElapsedSec >= SPIRITUAL_SUSTAIN_SEC &&
    dominantTradition &&
    meetsTraditionGate({
      tradition: dominantTradition,
      spiritualDepth,
      sessionsCompleted,
      simTimeSeconds,
      spatialExponent,
      mode,
    }) &&
    entanglements.length === 0;

  useEffect(() => {
    if (introActive || mode !== 'embodied') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'j' || e.repeat) return;
      jHeld.current = true;
      if (canSplit) splitStart.current = performance.now();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'j') return;
      jHeld.current = false;
      splitStart.current = null;
      setSplitProgress(0);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [introActive, mode, canSplit]);

  useEffect(() => {
    if (!jHeld.current || !canSplit || splitStart.current === null) return;
    let raf = 0;
    const tick = () => {
      const elapsed = (performance.now() - splitStart.current!) / 1000;
      const progress = Math.min(1, elapsed / SPLIT_HOLD_SEC);
      setSplitProgress(progress);
      if (progress >= 1) {
        performSplit(currentWorldId, [
          { kindId: 'correspondence-node', x: 2, z: -2 },
        ]);
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

  if (!canSplit && splitProgress <= 0 && entanglements.length === 0) return null;

  return (
    <div className="split-controls ui-panel" data-testid="split-controls">
      {entanglements.length > 0 ? (
        <p>Astral self active — rare senses may arrive. Press K to rejoin.</p>
      ) : (
        <>
          <p>Hold J to split — astral counterpart persists in esoteric layer.</p>
          {splitProgress > 0 && (
            <div className="split-progress" data-testid="split-progress">
              {Math.round(splitProgress * 100)}%
            </div>
          )}
        </>
      )}
    </div>
  );
}
