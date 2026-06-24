import { useEffect, useRef } from 'react';
import {
  AVATAR_TURN_SPEED,
  AVATAR_WALK_SPEED,
  clampAvatarToSite,
  sampleTerrainHeight,
} from '../core/embodiment';
import { useIntroActive } from '../core/IntroSkipHandler';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';

export function EmbodiedControls() {
  const introActive = useIntroActive();
  const mode = useObserverStore((s) => s.mode);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const keysDown = useRef(new Set<string>());
  const lastFrame = useRef(performance.now());

  useEffect(() => {
    if (mode !== 'embodied' || introActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      keysDown.current.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [mode, introActive]);

  useEffect(() => {
    if (mode !== 'embodied' || introActive || isFlying) return;

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame.current) / 1000);
      lastFrame.current = now;

      const keys = keysDown.current;
      let forward = 0;
      let turn = 0;
      if (keys.has('w') || keys.has('arrowup')) forward += 1;
      if (keys.has('s') || keys.has('arrowdown')) forward -= 1;
      if (keys.has('a') || keys.has('arrowleft')) turn += 1;
      if (keys.has('d') || keys.has('arrowright')) turn -= 1;

      if (forward !== 0 || turn !== 0) {
        const state = useObserverStore.getState();
        let yaw = state.avatarYaw + turn * AVATAR_TURN_SPEED * dt;

        const pos = state.avatarPosition.clone();
        if (forward !== 0) {
          pos.x += Math.sin(yaw) * forward * AVATAR_WALK_SPEED * dt;
          pos.z += Math.cos(yaw) * forward * AVATAR_WALK_SPEED * dt;
        }

        const clamped = clampAvatarToSite(pos.x, pos.z);
        pos.x = clamped.x;
        pos.z = clamped.z;
        pos.y = sampleTerrainHeight(clamped.x, clamped.z);

        useObserverStore.setState({ avatarPosition: pos, avatarYaw: yaw });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, introActive, isFlying]);

  return null;
}
