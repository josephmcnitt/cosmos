import {
  computeEffectiveTimeWindow,
  getEventsForSpatialBand,
  storedTimeWindowOptions,
  tickPositionInWindow,
} from '../core/spatialTimeCoupling';
import type { HistoryDomain } from '../data/history/types';
import { flyToEvent } from '../core/flyToEvent';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { getSpatialBand } from '../core/ScaleSpace';
import { formatSimTimeShort } from '../core/TimeSpace';

const DOMAIN_COLORS: Record<HistoryDomain, string> = {
  cosmic: '#6a9cff',
  geologic: '#e8a84a',
  biologic: '#5ecf8a',
  human: '#e87a9a',
};

export function TimelineEventTicks() {
  const domainFilter = useHistoryStore((s) => s.domainFilter);
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const temporalExponent = useObserverStore((s) => s.temporalExponent);
  const timeViewMinLog = useObserverStore((s) => s.timeViewMinLog);
  const timeViewMaxLog = useObserverStore((s) => s.timeViewMaxLog);

  const band = getSpatialBand(spatialExponent);
  const timeWindow = computeEffectiveTimeWindow(
    spatialExponent,
    simTimeSeconds,
    temporalExponent,
    storedTimeWindowOptions(timeViewMinLog, timeViewMaxLog),
  );

  const bandEvents = getEventsForSpatialBand(band.id);
  const events =
    domainFilter === 'all'
      ? bandEvents
      : bandEvents.filter((e) => e.domain === domainFilter);

  const handleClick = (
    e: React.MouseEvent,
    event: (typeof events)[0],
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (isFlying) return;
    void flyToEvent(event);
  };

  return (
    <div className="timeline-ticks" aria-hidden={isFlying}>
      {events.map((event) => {
        const pos = tickPositionInWindow(event.simTimeSeconds, timeWindow);
        if (pos === null) return null;
        const selected = selectedEventId === event.id;
        return (
          <button
            key={event.id}
            type="button"
            className={`timeline-tick timeline-tick--${event.domain}${selected ? ' timeline-tick--selected' : ''}`}
            style={{
              left: `${pos * 100}%`,
              ['--tick-color' as string]: DOMAIN_COLORS[event.domain],
            }}
            title={`${event.title} · ${formatSimTimeShort(event.simTimeSeconds)}`}
            onClick={(ev) => handleClick(ev, event)}
            onPointerDown={(ev) => ev.stopPropagation()}
          />
        );
      })}
    </div>
  );
}
