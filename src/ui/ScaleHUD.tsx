import { getEventById, getNearestEventForBand } from '../data/history/index';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { formatSimTime, formatSimTimeShort } from '../core/TimeSpace';
import { getSpatialBand, metersFromExponent } from '../core/ScaleSpace';
import {
  isHumanSpatialBand,
  isInHumanEra,
} from '../core/spatialTimeCoupling';

export function ScaleHUD() {
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const playbackRate = useObserverStore((s) => s.playbackRate);
  const showDebugGrid = useObserverStore((s) => s.showDebugGrid);
  const historyTrack = useHistoryStore((s) => s.historyTrack);
  const goToHumanEra = useObserverStore((s) => s.goToHumanEra);
  const depthOfView = useHistoryStore((s) => s.depthOfView);
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);
  const isFlying = useHistoryStore((s) => s.isFlying);

  const nearest = getNearestEventForBand(simTimeSeconds, spatialExponent);
  const nearLabel =
    selectedEventId && nearest?.id === selectedEventId
      ? nearest.title
      : nearest
        ? `Near: ${nearest.title}`
        : null;

  const spatialBandLabel = getSpatialBand(spatialExponent).label;
  const atHumanScale = isHumanSpatialBand(spatialExponent);
  const inHumanEra = isInHumanEra(simTimeSeconds);
  const epochMismatch = atHumanScale && !inHumanEra && mode !== 'embodied';

  const distance = metersFromExponent(spatialExponent);
  const distanceLabel =
    spatialExponent >= 6
      ? `${distance.toExponential(1)} m`
      : `${distance.toFixed(distance < 10 ? 2 : 0)} m`;

  if (mode === 'embodied') {
    const discovered = selectedEventId ? getEventById(selectedEventId) : null;
    return (
      <div className="hud ui-panel hud--embodied">
        <div className="hud-title">Cosmos</div>
        <div className="hud-row">
          <span className="hud-label">Mode</span>
          <span className="hud-value hud-walking">Walking</span>
        </div>
        <div className="hud-row hud-muted">
          <span className="hud-label">Era</span>
          <span>{formatSimTimeShort(simTimeSeconds)}</span>
        </div>
        {discovered && (
          <div className="hud-row hud-muted">
            <span className="hud-label">Discovered</span>
            <span>{discovered.title}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hud ui-panel">
      <div className="hud-title">Cosmos</div>
      <div className="hud-row">
        <span className="hud-label">Space</span>
        <span className="hud-value">{spatialBandLabel}</span>
      </div>
      <div className="hud-row hud-muted">
        <span className="hud-label">Scale</span>
        <span>{distanceLabel}</span>
      </div>
      <div className="hud-row">
        <span className="hud-label">Epoch</span>
        <span className="hud-value">{inHumanEra ? 'Human' : 'Deep time'}</span>
      </div>
      <div className="hud-row hud-muted">
        <span className="hud-label">Time</span>
        <span>{formatSimTime(simTimeSeconds)}</span>
      </div>
      <div className="hud-row">
        <span className="hud-label">Speed</span>
        <span className="hud-value">{playbackRate === 0 ? 'Paused' : `${playbackRate}×`}</span>
      </div>
      <div className="hud-row">
        <span className="hud-label">Track</span>
        <span className="hud-value">
          {historyTrack === 'spiritual' ? 'Spiritual' : 'Material'}
        </span>
      </div>
      {historyTrack === 'spiritual' && (
        <div className="hud-row">
          <span className="hud-label">Depth</span>
          <span className="hud-value">
            {depthOfView === 'full' ? 'Full' : 'Exoteric'}
          </span>
        </div>
      )}
      {nearLabel && (
        <div className="hud-row hud-muted">
          <span className="hud-label">Event</span>
          <span>{isFlying ? 'Traveling…' : nearLabel}</span>
        </div>
      )}
      {epochMismatch && (
        <button
          type="button"
          className="hud-warning hud-warning-btn"
          onClick={goToHumanEra}
        >
          Human scale · jump to present →
        </button>
      )}
      {showDebugGrid && <div className="hud-debug">Debug grid on (~)</div>}
    </div>
  );
}

export function TimelineLabel() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  return (
    <div className="timeline-current ui-panel">
      {formatSimTimeShort(simTimeSeconds)}
    </div>
  );
}

