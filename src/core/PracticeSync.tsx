import { useEffect, useRef } from 'react';
import { getNearestSiteMarker } from '../data/embodied/siteMarkers';
import {
  applyResonanceDecay,
  computeNextRealmPhase,
  computeSpiritualDepth,
  dominantTradition,
  isAtStoneWithHighDepth,
} from './practice';
import { usePracticeStore } from './PracticeState';
import { useObserverStore } from './ObserverState';

export function PracticeSync() {
  const mode = useObserverStore((s) => s.mode);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const lastTick = useRef(performance.now());
  const sustainRef = useRef(0);

  useEffect(() => {
    if (mode !== 'embodied') {
      sustainRef.current = 0;
      usePracticeStore.getState().setSustainElapsed(0);
    }
  }, [mode]);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const now = performance.now();
      const dtSec = Math.min(0.1, (now - lastTick.current) / 1000);
      lastTick.current = now;

      const practice = usePracticeStore.getState();
      const observer = useObserverStore.getState();
      const embodied = observer.mode === 'embodied';

      const marker = embodied
        ? getNearestSiteMarker(avatarPosition.x, avatarPosition.z)
        : undefined;
      practice.setNearbyEventId(marker?.eventId ?? null);

      if (practice.activePractice) {
        practice.tickPractice(now);
      } else if (!embodied || dtSec > 0) {
        const decayed = applyResonanceDecay(practice.resonance, dtSec, embodied);
        const depth = computeSpiritualDepth(decayed);
        const atStone = isAtStoneWithHighDepth(depth, marker);

        if (atStone && embodied) {
          sustainRef.current += dtSec;
        } else {
          sustainRef.current = 0;
        }

        const nextPhase = computeNextRealmPhase(
          practice.realmPhase,
          depth,
          sustainRef.current,
          atStone && embodied,
        );

        usePracticeStore.setState({
          resonance: decayed,
          spiritualDepth: depth,
          dominantTradition: dominantTradition(decayed),
          realmPhase: embodied ? nextPhase : 'material',
          sustainElapsedSec: sustainRef.current,
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, avatarPosition.x, avatarPosition.z]);

  return null;
}
