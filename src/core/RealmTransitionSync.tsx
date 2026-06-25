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
import { embodimentApproachWeight } from './embodiment';

export function RealmTransitionSync() {
  const embodimentTransition = useObserverStore((s) => s.embodimentTransition);

  const displayWeightRef = useRef(0);
  const overlayRef = useRef(0);
  const embodimentStartRef = useRef(0);
  const lastEmbTransition = useRef(embodimentTransition);
  const cssRef = useRef({
    liminal: '0',
    spiritual: '0',
    accent: '#7868a8',
    fade: '0',
  });

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

      const observer = useObserverStore.getState();
      const practice = usePracticeStore.getState();
      const embodied = observer.mode === 'embodied';
      const targetPhase = embodied ? practice.realmPhase : 'material';
      const targetWeight = phaseWeight(targetPhase);

      displayWeightRef.current = stepToward(
        displayWeightRef.current,
        targetWeight,
        dtSec,
        REALM_TRANSITION_SEC,
      );

      const weights = weightsFromDisplay(displayWeightRef.current);

      let overlay = 0;
      const embTransition = observer.embodimentTransition;
      if (embTransition !== 'none') {
        const exp = observer.spatialExponent;
        const seamlessEnter =
          embTransition === 'entering' && embodimentApproachWeight(exp) >= 0.85;
        if (!seamlessEnter) {
          const elapsed = now - embodimentStartRef.current;
          const half = EMBODIMENT_TRANSITION_MS / 2;
          if (elapsed < half) {
            overlay = elapsed / half;
          } else if (elapsed < EMBODIMENT_TRANSITION_MS) {
            overlay = 1 - (elapsed - half) / half;
          }
        }
      }
      overlayRef.current = overlay;

      const display = useRealmDisplayStore.getState();
      if (
        display.displayWeight !== displayWeightRef.current ||
        display.liminalWeight !== weights.liminal ||
        display.spiritualWeight !== weights.spiritual ||
        display.embodimentOverlay !== overlay
      ) {
        useRealmDisplayStore.getState().setDisplay({
          displayWeight: displayWeightRef.current,
          liminalWeight: weights.liminal,
          spiritualWeight: weights.spiritual,
          embodimentOverlay: overlay,
        });
      }

      const app = document.querySelector('.app');
      if (app instanceof HTMLElement) {
        const liminal = String(weights.liminal);
        const spiritual = String(weights.spiritual);
        const accent = traditionAccent(practice.dominantTradition);
        const fade = String(overlay);
        const css = cssRef.current;
        if (
          css.liminal !== liminal ||
          css.spiritual !== spiritual ||
          css.accent !== accent ||
          css.fade !== fade
        ) {
          app.style.setProperty('--realm-liminal', liminal);
          app.style.setProperty('--realm-spiritual', spiritual);
          app.style.setProperty('--tradition-accent', accent);
          app.style.setProperty('--embodiment-fade', fade);
          cssRef.current = { liminal, spiritual, accent, fade };
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
