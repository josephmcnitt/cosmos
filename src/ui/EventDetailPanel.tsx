import { getCrossLinks, getEventById, isEventAtVisibleScale } from '../data/history/index';
import {
  DOMAIN_LABELS,
  isMaterialEvent,
  isSpiritualEvent,
  TRADITION_LABELS,
} from '../data/history/types';
import { flyToEvent } from '../core/flyToEvent';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { SPATIAL_BANDS } from '../core/ScaleSpace';
import { formatSimTime } from '../core/TimeSpace';

export function EventDetailPanel() {
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);
  const selectEvent = useHistoryStore((s) => s.selectEvent);
  const depthOfView = useHistoryStore((s) => s.depthOfView);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);

  if (!selectedEventId) return null;

  const event = getEventById(selectedEventId);
  if (!event) return null;

  const atScale = isEventAtVisibleScale(event, spatialExponent);
  const bandLabel =
    SPATIAL_BANDS.find((b) => b.id === event.spatialBand)?.label ?? event.spatialBand;

  const crossLinks = getCrossLinks(selectedEventId);
  const hiddenEsotericLinks =
    depthOfView !== 'full'
      ? crossLinks.spiritual.filter((e) => e.visibility === 'esoteric')
      : [];

  return (
    <div className="event-detail ui-panel">
      <button
        type="button"
        className="event-detail-close"
        onClick={() => selectEvent(null)}
        aria-label="Close"
      >
        ×
      </button>

      {isMaterialEvent(event) && (
        <span className={`event-domain event-domain--${event.domain}`}>
          {DOMAIN_LABELS[event.domain]}
        </span>
      )}

      {isSpiritualEvent(event) && (
        <div className="event-detail-badges">
          <span className={`event-tradition event-tradition--${event.tradition}`}>
            {TRADITION_LABELS[event.tradition]}
          </span>
          <span
            className={`event-visibility event-visibility--${event.visibility}`}
          >
            {event.visibility === 'esoteric' ? 'Esoteric' : 'Exoteric'}
          </span>
        </div>
      )}

      <h2 className="event-detail-title">{event.title}</h2>
      <p className="event-detail-time">{formatSimTime(event.simTimeSeconds)}</p>

      {!atScale && bandLabel && (
        <p className="event-detail-scale-hint">
          Zoom to {bandLabel} scale to fully view this event
        </p>
      )}

      <p className="event-detail-summary">{event.summary}</p>

      {isSpiritualEvent(event) && event.body && (
        <p className="event-detail-body">{event.body}</p>
      )}

      {crossLinks.material.length > 0 && (
        <div className="event-detail-crosslinks">
          <div className="event-detail-crosslinks-label">Related in material history</div>
          <div className="event-detail-crosslinks-chips">
            {crossLinks.material.map((linked) => (
              <button
                key={linked.id}
                type="button"
                className={`event-crosslink event-crosslink--material event-crosslink--${isMaterialEvent(linked) ? linked.domain : 'human'}`}
                onClick={() => void flyToEvent(linked)}
              >
                {linked.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {crossLinks.spiritual.length > 0 && (
        <div className="event-detail-crosslinks">
          <div className="event-detail-crosslinks-label">Related in spiritual history</div>
          <div className="event-detail-crosslinks-chips">
            {crossLinks.spiritual.map((linked) => {
              const locked =
                linked.visibility === 'esoteric' && depthOfView !== 'full';
              return (
                <button
                  key={linked.id}
                  type="button"
                  className={`event-crosslink event-crosslink--spiritual event-crosslink--${linked.tradition}${locked ? ' event-crosslink--locked' : ''}`}
                  title={locked ? 'Enable Full Depth to view' : undefined}
                  onClick={() => {
                    if (locked) return;
                    void flyToEvent(linked);
                  }}
                >
                  {linked.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hiddenEsotericLinks.length > 0 && (
        <p className="event-detail-esoteric-hint">
          {hiddenEsotericLinks.length} esoteric link
          {hiddenEsotericLinks.length > 1 ? 's' : ''} hidden — enable Full Depth
        </p>
      )}

      {event.sourceUrl && (
        <a
          className="event-detail-source"
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      )}
    </div>
  );
}
