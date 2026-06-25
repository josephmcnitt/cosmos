import { useEffect } from 'react';
import { getAdjacentTimelineEvent, getVisibleTimelineEvents } from '../data/history/index';
import { flyToEvent } from '../core/flyToEvent';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { computeEffectiveTimeWindow, storedTimeWindowOptions } from '../core/spatialTimeCoupling';
import { useIntroActive } from '../core/IntroSkipHandler';

export function HistoryKeyboard() {
  const introActive = useIntroActive();
  const selectEvent = useHistoryStore((s) => s.selectEvent);

  useEffect(() => {
    if (introActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (useHistoryStore.getState().isFlying) return;

      if (e.key === 'Escape') {
        selectEvent(null);
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const history = useHistoryStore.getState();
        const observer = useObserverStore.getState();
        const timeWindow = computeEffectiveTimeWindow(
          observer.spatialExponent,
          observer.simTimeSeconds,
          observer.temporalExponent,
          storedTimeWindowOptions(observer.timeViewMinLog, observer.timeViewMaxLog),
        );

        const navOptions = {
          spatialExponent: observer.spatialExponent,
          viewMinSeconds: timeWindow.viewMinSeconds,
          viewMaxSeconds: timeWindow.viewMaxSeconds,
          domainFilter: history.domainFilter,
          traditionFilter: history.traditionFilter,
          depthOfView: history.depthOfView,
          historyTrack: history.historyTrack,
        };

        const visible = getVisibleTimelineEvents(navOptions);
        const currentId = history.selectedEventId;

        if (!currentId) {
          const first =
            e.key === 'ArrowRight' ? visible[0] : visible[visible.length - 1];
          if (first) void flyToEvent(first);
          return;
        }

        const adjacent = getAdjacentTimelineEvent(
          currentId,
          e.key === 'ArrowRight' ? 'next' : 'prev',
          navOptions,
        );
        if (adjacent) void flyToEvent(adjacent);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [introActive, selectEvent]);

  return null;
}
