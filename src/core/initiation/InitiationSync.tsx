import { useEffect, useRef } from 'react';
import { getInitiationById, getStep } from '../../data/initiations/index';
import { isChooseResolved, isStepComplete } from '../initiation/runInitiation';
import { useObserverStore } from '../ObserverState';
import { usePracticeStore } from '../PracticeState';
import { useWorldStore } from '../world/WorldState';

/** Ticks active initiation steps (hold-still, silence, walk-to, face-direction, choose). */
export function InitiationSync() {
  const activeInitiation = useWorldStore((s) => s.activeInitiation);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const avatarYaw = useObserverStore((s) => s.avatarYaw);
  const avatarMoving = usePracticeStore((s) => s.avatarMoving);
  const keysPressed = useRef(false);

  useEffect(() => {
    const onKey = () => {
      keysPressed.current = true;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    keysPressed.current = false;
  }, [activeInitiation?.stepIndex, activeInitiation?.initiationId]);

  useEffect(() => {
    if (!activeInitiation) return;

    let raf = 0;
    const tick = () => {
      const active = useWorldStore.getState().activeInitiation;
      if (!active) return;

      const def = getInitiationById(active.initiationId);
      if (!def) return;
      const step = getStep(def, active.stepIndex);
      if (!step) return;

      if (step.type === 'dialogue') {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (step.type === 'choose') {
        if (active.choiceId && isChooseResolved(step, active.choiceId)) {
          useWorldStore.getState().advanceInitiationStep();
          return;
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      const complete = isStepComplete(step, {
        playerX: avatarPosition.x,
        playerZ: avatarPosition.z,
        playerYaw: avatarYaw,
        avatarMoving,
        stepStartedAt: active.stepStartedAt,
        choiceId: active.choiceId,
        keysPressedSinceStep: keysPressed.current,
      });

      if (complete) {
        keysPressed.current = false;
        useWorldStore.getState().advanceInitiationStep();
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeInitiation, avatarPosition.x, avatarPosition.z, avatarYaw, avatarMoving]);

  return null;
}
