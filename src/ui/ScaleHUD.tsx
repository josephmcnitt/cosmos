import { getEventById, getNearestEventForBand } from '../data/history/index';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { formatPlayheadTime, formatSimTimeShort, formatTimelineHeader, yearsAgoLogSpan } from '../core/TimeSpace';
import { getSpatialBand, metersFromExponent } from '../core/ScaleSpace';
import {
  bandLogSpan,
  computeEffectiveTimeWindow,
  isEffectiveWindowNarrowed,
  isHumanSpatialBand,
  isInHumanEra,
  storedTimeWindowOptions,
} from '../core/spatialTimeCoupling';
import { usePracticeStore } from '../core/PracticeState';
import { useWorldStore } from '../core/world/WorldState';

export function ScaleHUD() {
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const temporalExponent = useObserverStore((s) => s.temporalExponent);
  const timeViewMinLog = useObserverStore((s) => s.timeViewMinLog);
  const timeViewMaxLog = useObserverStore((s) => s.timeViewMaxLog);
  const playbackRate = useObserverStore((s) => s.playbackRate);
  const showDebugGrid = useObserverStore((s) => s.showDebugGrid);
  const historyTrack = useHistoryStore((s) => s.historyTrack);
  const goToHumanEra = useObserverStore((s) => s.goToHumanEra);
  const depthOfView = useHistoryStore((s) => s.depthOfView);
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const spiritualDepth = usePracticeStore((s) => s.spiritualDepth);
  const realmPhase = usePracticeStore((s) => s.realmPhase);
  const sessionsCompleted = useWorldStore((s) => s.sessionsCompleted);

  const nearest = getNearestEventForBand(simTimeSeconds, spatialExponent);
  const nearLabel =
    selectedEventId && nearest?.id === selectedEventId
      ? nearest.title
      : nearest
        ? `Near: ${nearest.title}`
        : null;

  const spatialBand = getSpatialBand(spatialExponent);
  const spatialBandLabel = spatialBand.label;
  const atHumanScale = isHumanSpatialBand(spatialExponent);
  const inHumanEra = isInHumanEra(simTimeSeconds);
  const epochMismatch = atHumanScale && !inHumanEra && mode !== 'embodied';

  const distance = metersFromExponent(spatialExponent);
  const distanceLabel =
    spatialExponent >= 6
      ? `${distance.toExponential(1)} m`
      : `${distance.toFixed(distance < 10 ? 2 : 0)} m`;

  const timeWindow = computeEffectiveTimeWindow(
    spatialExponent,
    simTimeSeconds,
    temporalExponent,
    storedTimeWindowOptions(timeViewMinLog, timeViewMaxLog),
  );
  const viewLogSpan = yearsAgoLogSpan(timeWindow.viewMinSeconds, timeWindow.viewMaxSeconds);
  const fullLogSpan = bandLogSpan(timeWindow);
  const timeNarrowed = isEffectiveWindowNarrowed(timeWindow);
  const windowLabel = formatTimelineHeader(
    timeWindow.viewMinSeconds,
    timeWindow.viewMaxSeconds,
    viewLogSpan,
    fullLogSpan,
  );
  const playheadLabel = formatPlayheadTime(simTimeSeconds, viewLogSpan, inHumanEra);
  const timeLabel = timeNarrowed ? `${playheadLabel} · ${windowLabel}` : playheadLabel;

  if (mode === 'embodied') {
    const discovered = selectedEventId ? getEventById(selectedEventId) : null;
    return (
      <div className="hud ui-panel hud--embodied" data-testid="hud-embodied">
        <div className="hud-title">Cosmos</div>
        <div className="hud-row">
          <span className="hud-label">Mode</span>
          <span className="hud-value hud-walking" data-testid="hud-walking">Walking</span>
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
        {showDebugGrid && (
          <div className="hud-row hud-debug">
            <span className="hud-label">Realm</span>
            <span>
              {realmPhase} · depth {spiritualDepth.toFixed(2)} · {sessionsCompleted} sessions
            </span>
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
        <span className="hud-value" data-testid="hud-spatial-band" data-band-id={spatialBand.id}>
          {spatialBandLabel}
        </span>
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
        <span data-testid="hud-time">{timeLabel}</span>
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
          data-testid="jump-to-present"
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
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const temporalExponent = useObserverStore((s) => s.temporalExponent);
  const timeViewMinLog = useObserverStore((s) => s.timeViewMinLog);
  const timeViewMaxLog = useObserverStore((s) => s.timeViewMaxLog);
  const timeWindow = computeEffectiveTimeWindow(
    spatialExponent,
    simTimeSeconds,
    temporalExponent,
    storedTimeWindowOptions(timeViewMinLog, timeViewMaxLog),
  );
  const viewLogSpan = yearsAgoLogSpan(timeWindow.viewMinSeconds, timeWindow.viewMaxSeconds);
  return (
    <div className="timeline-current ui-panel" data-testid="timeline-current">
      {formatPlayheadTime(simTimeSeconds, viewLogSpan, isInHumanEra(simTimeSeconds))}
    </div>
  );
}

