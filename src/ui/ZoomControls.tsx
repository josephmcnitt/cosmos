import { useEffect } from 'react';
import { useIntroStore } from '../core/IntroState';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import {
  isKeyboardZoomBlocked,
  KEYBOARD_WHEEL_DELTA,
  resolveKeyboardZoomAction,
  resolveKeyboardZoomDirection,
} from '../core/keyboardZoom';
import { computeEffectiveTimeWindow, isEffectiveWindowNarrowed, storedTimeWindowOptions } from '../core/spatialTimeCoupling';
import { yearsAgoLogSpan } from '../core/TimeSpace';
import { handleWheelZoomEvent, wheelDeltaToAdjustment } from '../core/wheelZoom';

export function ZoomControls() {
  const mode = useObserverStore((s) => s.mode);
  const adjustSpatial = useObserverStore((s) => s.adjustSpatialExponent);
  const adjustTemporal = useObserverStore((s) => s.adjustTemporalExponent);
  const panTimeViewAnchor = useObserverStore((s) => s.panTimeViewAnchor);
  const adjustCameraDistance = useObserverStore((s) => s.adjustCameraDistance);
  const adjustEarthOrbitDistance = useObserverStore((s) => s.adjustEarthOrbitDistance);
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const isFlying = useHistoryStore((s) => s.isFlying);

  useEffect(() => {
    if (!introComplete || isFlying) return;

    const applyZoom = (
      action: ReturnType<typeof resolveKeyboardZoomAction>,
      deltaY: number,
      shiftKey: boolean,
    ) => {
      if (action === 'temporal' && shiftKey) {
        const observer = useObserverStore.getState();
        const window = computeEffectiveTimeWindow(
          observer.spatialExponent,
          observer.simTimeSeconds,
          observer.temporalExponent,
          storedTimeWindowOptions(observer.timeViewMinLog, observer.timeViewMaxLog),
        );
        if (isEffectiveWindowNarrowed(window)) {
          const viewSpan = yearsAgoLogSpan(window.viewMinSeconds, window.viewMaxSeconds);
          panTimeViewAnchor(-deltaY * 0.002 * viewSpan);
          return;
        }
      }

      const adjustment = wheelDeltaToAdjustment(deltaY, action);
      const observerMode = useObserverStore.getState().mode;
      switch (action) {
        case 'spatial':
          adjustSpatial(adjustment);
          break;
        case 'temporal':
          adjustTemporal(adjustment);
          break;
        case 'camera':
          if (observerMode === 'earth') {
            adjustEarthOrbitDistance(adjustment);
          } else {
            adjustCameraDistance(adjustment);
          }
          break;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (useHistoryStore.getState().isFlying) return;

      const observerMode = useObserverStore.getState().mode;
      if (observerMode === 'earth' && !e.shiftKey) return;

      const result = handleWheelZoomEvent(
        { target: e.target, shiftKey: e.shiftKey, deltaY: e.deltaY },
        observerMode,
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
          const viewSpan = yearsAgoLogSpan(window.viewMinSeconds, window.viewMaxSeconds);
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
          if (observerMode === 'earth') {
            adjustEarthOrbitDistance(result.adjustment);
          } else {
            adjustCameraDistance(result.adjustment);
          }
          break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (useHistoryStore.getState().isFlying) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isKeyboardZoomBlocked(e.target)) return;

      const direction = resolveKeyboardZoomDirection(e.key);
      if (!direction) return;

      const observerMode = useObserverStore.getState().mode;
      const action = resolveKeyboardZoomAction(e.shiftKey, observerMode);
      const deltaY = KEYBOARD_WHEEL_DELTA[direction];

      e.preventDefault();
      applyZoom(action, deltaY, e.shiftKey);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    adjustSpatial,
    adjustTemporal,
    panTimeViewAnchor,
    adjustCameraDistance,
    adjustEarthOrbitDistance,
    introComplete,
    isFlying,
    mode,
  ]);

  return null;
}
