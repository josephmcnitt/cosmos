import { useEffect, useRef } from 'react';
import { getNearestSiteMarker, MARKER_PRACTICE_RADIUS } from '../data/embodied/siteMarkers';
import { canStartPractice, PRACTICE_CHAIN_COOLDOWN_SEC } from '../core/practice';
import { useIntroActive } from '../core/IntroSkipHandler';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';

export function PracticeControls() {
  const introActive = useIntroActive();
  const mode = useObserverStore((s) => s.mode);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const avatarMoving = usePracticeStore((s) => s.avatarMoving);
  const activePractice = usePracticeStore((s) => s.activePractice);
  const qHeld = useRef(false);

  useEffect(() => {
    if (avatarMoving && activePractice) {
      usePracticeStore.getState().cancelPractice();
    }
  }, [avatarMoving, activePractice]);

  useEffect(() => {
    if (mode !== 'embodied' || introActive || isFlying) return;

    const tryStart = () => {
      if (!qHeld.current || usePracticeStore.getState().activePractice) return;

      const observer = useObserverStore.getState();
      const marker = getNearestSiteMarker(
        observer.avatarPosition.x,
        observer.avatarPosition.z,
        MARKER_PRACTICE_RADIUS,
      );
      const practice = usePracticeStore.getState();
      if (!canStartPractice(observer.mode, marker, practice.avatarMoving)) return;
      if (!marker) return;

      const sinceComplete = performance.now() - practice.lastCompletedAt;
      if (
        practice.lastCompletedAt > 0 &&
        sinceComplete < PRACTICE_CHAIN_COOLDOWN_SEC * 1000
      ) {
        return;
      }

      practice.startPractice(marker.eventId);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'q' || e.repeat) return;
      qHeld.current = true;
      tryStart();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'q') return;
      qHeld.current = false;
      const practice = usePracticeStore.getState();
      if (practice.activePractice) {
        practice.cancelPractice();
      }
    };

    let raf = 0;
    const pollChain = () => {
      if (qHeld.current) tryStart();
      raf = requestAnimationFrame(pollChain);
    };
    raf = requestAnimationFrame(pollChain);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      qHeld.current = false;
    };
  }, [mode, introActive, isFlying]);

  return null;
}
