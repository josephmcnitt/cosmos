import { useEffect } from 'react';
import { useIntroStore } from '../core/IntroState';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';

export function ZoomControls() {
  const mode = useObserverStore((s) => s.mode);
  const adjustSpatial = useObserverStore((s) => s.adjustSpatialExponent);
  const adjustTemporal = useObserverStore((s) => s.adjustTemporalExponent);
  const adjustCameraDistance = useObserverStore((s) => s.adjustCameraDistance);
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const isFlying = useHistoryStore((s) => s.isFlying);

  useEffect(() => {
    if (!introComplete || isFlying) return;

    const onWheel = (e: WheelEvent) => {
      if (useHistoryStore.getState().isFlying) return;
      if (e.target instanceof HTMLElement && e.target.closest('.ui-panel')) return;

      e.preventDefault();
      const delta = -e.deltaY * 0.002;

      if (useObserverStore.getState().mode === 'embodied') {
        if (e.shiftKey) {
          adjustTemporal(delta * 0.5);
        } else {
          adjustCameraDistance(-delta * 6);
        }
        return;
      }

      if (e.shiftKey) {
        adjustTemporal(delta * 0.5);
      } else {
        adjustSpatial(delta);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [adjustSpatial, adjustTemporal, adjustCameraDistance, introComplete, isFlying, mode]);

  return null;
}
