import { useEffect, useRef } from 'react';
import { usePracticeStore } from './PracticeState';
import { useObserverStore } from './ObserverState';
import {
  EMBODIMENT_TRANSITION_MS,
  phaseWeight,
  REALM_TRANSITION_SEC,
  stepToward,
  traditionAccent,
  weightsFromDisplay,
} from './realmTransition';
import { useRealmDisplayStore } from './RealmDisplayState';

export function RealmTransitionSync() {
  const realmPhase = usePracticeStore((s) => s.realmPhase);
  const dominantTradition = usePracticeStore((s) => s.dominantTradition);
  const mode = useObserverStore((s) => s.mode);
  const embodimentTransition = useObserverStore((s) => s.embodimentTransition);

  const displayWeightRef = useRef(0);
  const overlayRef = useRef(0);
  const embodimentStartRef = useRef(0);
  const lastEmbTransition = useRef(embodimentTransition);

  useEffect(() => {
    if (embodimentTransition !== lastEmbTransition.current && embodimentTransition !== 'none') {
      embodimentStartRef.current = performance.now();
    }
    lastEmbTransition.current = embodimentTransition;
  }, [embodimentTransition]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dtSec = Math.min(0.1, (now - last) / 1000);
      last = now;

      const embodied = useObserverStore.getState().mode === 'embodied';
      const targetPhase = embodied ? usePracticeStore.getState().realmPhase : 'material';
      const targetWeight = phaseWeight(targetPhase);

      displayWeightRef.current = stepToward(
        displayWeightRef.current,
        targetWeight,
        dtSec,
        REALM_TRANSITION_SEC,
      );

      const weights = weightsFromDisplay(displayWeightRef.current);

      let overlay = 0;
      if (embodimentTransition !== 'none') {
        const elapsed = now - embodimentStartRef.current;
        const half = EMBODIMENT_TRANSITION_MS / 2;
        if (elapsed < half) {
          overlay = elapsed / half;
        } else if (elapsed < EMBODIMENT_TRANSITION_MS) {
          overlay = 1 - (elapsed - half) / half;
        }
      }
      overlayRef.current = overlay;

      useRealmDisplayStore.getState().setDisplay({
        displayWeight: displayWeightRef.current,
        liminalWeight: weights.liminal,
        spiritualWeight: weights.spiritual,
        embodimentOverlay: overlay,
      });

      const app = document.querySelector('.app');
      if (app instanceof HTMLElement) {
        app.style.setProperty('--realm-liminal', String(weights.liminal));
        app.style.setProperty('--realm-spiritual', String(weights.spiritual));
        app.style.setProperty('--tradition-accent', traditionAccent(dominantTradition));
        app.style.setProperty('--embodiment-fade', String(overlay));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [realmPhase, dominantTradition, mode, embodimentTransition]);

  return null;
}
