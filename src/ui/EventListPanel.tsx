import {
  ALL_TIMELINE_EVENTS,
  getEventsInEffectiveWindow,
  getHiddenEsotericCount,
} from '../data/history/index';
import { getSpiritualEventsInWindow } from '../data/spiritual/index';
import type { HistoryDomain, SpiritualTradition } from '../data/history/types';
import { TRADITION_LABELS } from '../data/history/types';
import { flyToEvent } from '../core/flyToEvent';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import {
  computeEffectiveTimeWindow,
  isHumanSpatialBand,
} from '../core/spatialTimeCoupling';
import { formatSimTimeShort } from '../core/TimeSpace';
import { HistoryTrackToggle } from './HistoryTrackToggle';

const DOMAIN_FILTERS: Array<{ id: HistoryDomain | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'cosmic', label: 'Cosmic' },
  { id: 'geologic', label: 'Geologic' },
  { id: 'biologic', label: 'Biologic' },
  { id: 'human', label: 'Human' },
];

const TRADITION_OPTIONS: Array<{ id: SpiritualTradition | 'all'; label: string }> = [
  { id: 'all', label: 'All traditions' },
  ...(
    Object.entries(TRADITION_LABELS) as Array<[SpiritualTradition, string]>
  ).map(([id, label]) => ({ id, label })),
];

export function EventListPanel() {
  const historyTrack = useHistoryStore((s) => s.historyTrack);
  const domainFilter = useHistoryStore((s) => s.domainFilter);
  const setDomainFilter = useHistoryStore((s) => s.setDomainFilter);
  const traditionFilter = useHistoryStore((s) => s.traditionFilter);
  const setTraditionFilter = useHistoryStore((s) => s.setTraditionFilter);
  const depthOfView = useHistoryStore((s) => s.depthOfView);
  const setDepthOfView = useHistoryStore((s) => s.setDepthOfView);
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const temporalExponent = useObserverStore((s) => s.temporalExponent);

  const atHumanScale = isHumanSpatialBand(spatialExponent);
  const showSpiritual = historyTrack === 'spiritual';

  const timeWindow = computeEffectiveTimeWindow(
    spatialExponent,
    simTimeSeconds,
    temporalExponent,
  );

  const materialEvents = (() => {
    const inWindow = getEventsInEffectiveWindow(
      spatialExponent,
      timeWindow.viewMinSeconds,
      timeWindow.viewMaxSeconds,
    );
    return domainFilter === 'all'
      ? inWindow
      : inWindow.filter((e) => e.domain === domainFilter);
  })();

  const spiritualEvents = atHumanScale
    ? getSpiritualEventsInWindow(
        spatialExponent,
        timeWindow.viewMinSeconds,
        timeWindow.viewMaxSeconds,
        depthOfView,
        traditionFilter,
      )
    : [];

  const hiddenCount = getHiddenEsotericCount(depthOfView);

  return (
    <div className="event-list ui-panel">
      <div className="event-list-header-row">
        <div className="event-list-header">History</div>
        <HistoryTrackToggle />
      </div>

      {showSpiritual ? (
        <>
          {!atHumanScale ? (
            <p className="event-list-spiritual-guide">
              Zoom to <strong>Human</strong> spatial scale to explore spiritual history.
            </p>
          ) : (
            <>
              <div className="event-tradition-chips">
                {TRADITION_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`event-tradition-chip${traditionFilter === id ? ' active' : ''}${id !== 'all' ? ` event-tradition-chip--${id}` : ''}`}
                    onClick={() => setTraditionFilter(id)}
                  >
                    {id === 'all' ? 'All' : label}
                  </button>
                ))}
              </div>

              {hiddenCount > 0 && depthOfView !== 'full' && (
                <button
                  type="button"
                  className="event-list-reveal-btn"
                  onClick={() => setDepthOfView('full')}
                >
                  Reveal {hiddenCount} esoteric streams
                </button>
              )}
            </>
          )}

          <ul className="event-list-items">
            {!atHumanScale && (
              <li className="event-list-empty">Not available at this spatial scale</li>
            )}
            {atHumanScale && spiritualEvents.length === 0 && (
              <li className="event-list-empty">
                Scrub toward <strong>Present</strong> to see events in this window
              </li>
            )}
            {atHumanScale &&
              spiritualEvents.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    className={`event-list-item event-list-item--spiritual${selectedEventId === event.id ? ' selected' : ''}${event.visibility === 'esoteric' ? ' event-list-item--esoteric' : ''}`}
                    disabled={isFlying}
                    onClick={() => void flyToEvent(event)}
                  >
                    <span className={`event-list-tradition event-list-tradition--${event.tradition}`} />
                    <span className="event-list-item-text">
                      <span className="event-list-item-title">{event.title}</span>
                      <span className="event-list-item-time">
                        {formatSimTimeShort(event.simTimeSeconds)}
                        {event.visibility === 'esoteric' && (
                          <span className="event-list-visibility"> · Esoteric</span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </>
      ) : (
        <>
          <div className="event-filter-chips">
            {DOMAIN_FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`event-filter-chip${domainFilter === id ? ' active' : ''}${id !== 'all' ? ` event-filter-chip--${id}` : ''}`}
                onClick={() => setDomainFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <ul className="event-list-items">
            {materialEvents.length === 0 && (
              <li className="event-list-empty">No events in this time window</li>
            )}
            {materialEvents.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  className={`event-list-item${selectedEventId === event.id ? ' selected' : ''}`}
                  disabled={isFlying}
                  onClick={() => void flyToEvent(event)}
                >
                  <span className={`event-list-domain event-list-domain--${event.domain}`} />
                  <span className="event-list-item-text">
                    <span className="event-list-item-title">{event.title}</span>
                    <span className="event-list-item-time">
                      {formatSimTimeShort(event.simTimeSeconds)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="event-list-footer">
        {ALL_TIMELINE_EVENTS.length} events · {showSpiritual ? 'Spiritual' : 'Material'} view
      </div>
    </div>
  );
}
