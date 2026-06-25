import { useEffect } from 'react';
import { useIntroStore } from '../core/IntroState';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { computeEffectiveTimeWindow, isEffectiveWindowNarrowed, storedTimeWindowOptions } from '../core/spatialTimeCoupling';
import { handleWheelZoomEvent } from '../core/wheelZoom';

export function ZoomControls() {
  const mode = useObserverStore((s) => s.mode);
  const adjustSpatial = useObserverStore((s) => s.adjustSpatialExponent);
  const adjustTemporal = useObserverStore((s) => s.adjustTemporalExponent);
  const panTimeViewAnchor = useObserverStore((s) => s.panTimeViewAnchor);
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

      if (result.action === 'temporal' && e.shiftKey) {
        const observer = useObserverStore.getState();
        const window = computeEffectiveTimeWindow(
          observer.spatialExponent,
          observer.simTimeSeconds,
          observer.temporalExponent,
          storedTimeWindowOptions(observer.timeViewMinLog, observer.timeViewMaxLog),
        );
        if (isEffectiveWindowNarrowed(window)) {
          const viewSpan = window.viewMaxLog - window.viewMinLog;
          panTimeViewAnchor(-e.deltaY * 0.002 * viewSpan);
          return;
        }
      }

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
  }, [
    adjustSpatial,
    adjustTemporal,
    panTimeViewAnchor,
    adjustCameraDistance,
    introComplete,
    isFlying,
    mode,
  ]);

  return null;
}
