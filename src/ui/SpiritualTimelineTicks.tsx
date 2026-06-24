import {
  computeEffectiveTimeWindow,
  tickPositionInWindow,
} from '../core/spatialTimeCoupling';
import { getSpiritualEventsInWindow } from '../data/spiritual/index';
import type { SpiritualTradition } from '../data/history/types';
import { flyToEvent } from '../core/flyToEvent';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { formatSimTimeShort } from '../core/TimeSpace';

const TRADITION_COLORS: Record<SpiritualTradition, string> = {
  kabbalah: '#d4a843',
  platonism: '#e8e0d0',
  neoplatonism: '#c8b8e8',
  hermetic: '#4ecdc4',
  gnosticism: '#b088f0',
  christian_mysticism: '#e8c878',
  sufism: '#78c8a0',
  buddhist_mysticism: '#a878c8',
  hindu_mysticism: '#f08858',
  alchemy: '#c87848',
  theosophy: '#88a8f0',
  general: '#a0a8b8',
};

export function SpiritualTimelineTicks() {
  const depthOfView = useHistoryStore((s) => s.depthOfView);
  const traditionFilter = useHistoryStore((s) => s.traditionFilter);
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const temporalExponent = useObserverStore((s) => s.temporalExponent);

  const timeWindow = computeEffectiveTimeWindow(
    spatialExponent,
    simTimeSeconds,
    temporalExponent,
  );

  const events = getSpiritualEventsInWindow(
    spatialExponent,
    timeWindow.viewMinSeconds,
    timeWindow.viewMaxSeconds,
    depthOfView,
    traditionFilter,
  );

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
    <div
      className={`spiritual-timeline-ticks${depthOfView === 'full' ? ' spiritual-timeline-ticks--full' : ''}`}
      aria-hidden={isFlying}
    >
      {events.map((event) => {
        const pos = tickPositionInWindow(event.simTimeSeconds, timeWindow);
        if (pos === null) return null;
        const selected = selectedEventId === event.id;
        const esoteric = event.visibility === 'esoteric';
        const tooltip =
          esoteric && depthOfView !== 'full'
            ? `${event.title} · Esoteric — enable Full Depth`
            : `${event.title} · ${formatSimTimeShort(event.simTimeSeconds)}`;
        return (
          <button
            key={event.id}
            type="button"
            className={`spiritual-timeline-tick spiritual-timeline-tick--${event.tradition}${selected ? ' spiritual-timeline-tick--selected' : ''}${esoteric ? ' spiritual-timeline-tick--esoteric' : ''}`}
            style={{
              left: `${pos * 100}%`,
              ['--tick-color' as string]: TRADITION_COLORS[event.tradition],
            }}
            title={tooltip}
            onClick={(ev) => handleClick(ev, event)}
            onPointerDown={(ev) => ev.stopPropagation()}
          />
        );
      })}
    </div>
  );
}
