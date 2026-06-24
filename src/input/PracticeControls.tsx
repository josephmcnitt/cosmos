import { useEffect, useRef } from 'react';
import { getNearestSiteMarker } from '../data/embodied/siteMarkers';
import { canStartPractice } from '../core/practice';
import { useIntroActive } from '../core/IntroSkipHandler';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';

export function PracticeControls() {
  const introActive = useIntroActive();
  const mode = useObserverStore((s) => s.mode);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
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
      const marker = getNearestSiteMarker(avatarPosition.x, avatarPosition.z);
      const practice = usePracticeStore.getState();
      if (!canStartPractice(mode, marker, practice.avatarMoving)) return;
      if (!marker) return;
      practice.startPractice(marker.eventId);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'q') return;
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

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      qHeld.current = false;
    };
  }, [mode, introActive, isFlying, avatarPosition.x, avatarPosition.z]);

  return null;
}
