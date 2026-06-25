import { useEffect } from 'react';
import { useIntroStore } from '../core/IntroState';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { handleWheelZoomEvent } from '../core/wheelZoom';

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

      const result = handleWheelZoomEvent(
        { target: e.target, shiftKey: e.shiftKey, deltaY: e.deltaY },
        useObserverStore.getState().mode,
      );

      if (result.blocked) return;

      e.preventDefault();

      switch (result.action) {
        case 'spatial':
          adjustSpatial(result.adjustment);
          break;
        case 'temporal':
          adjustTemporal(result.adjustment);
          break;
        case 'camera':
          adjustCameraDistance(result.adjustment);
          break;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [adjustSpatial, adjustTemporal, adjustCameraDistance, introComplete, isFlying, mode]);

  return null;
}
