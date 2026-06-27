import { useCallback, useRef } from 'react';
import { PLAYBACK_PRESETS } from '../core/SimulationClock';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import {
  bandLogSpan,
  computeEffectiveTimeWindow,
  isEffectiveWindowNarrowed,
  isHumanSpatialBand,
  isInHumanEra,
  normalizedFromSimTimeWindow,
  storedTimeWindowOptions,
} from '../core/spatialTimeCoupling';
import {
  formatPlayheadTime,
  formatSimTimeWindowEdge,
  formatTimelineHeader,
  getTemporalBand,
  TEMPORAL_MAX,
  TEMPORAL_MIN,
  yearsAgoLogSpan,
} from '../core/TimeSpace';
import { TimelineEventTicks } from './TimelineEventTicks';
import { SpiritualTimelineTicks } from './SpiritualTimelineTicks';
import { DepthOfViewToggle } from './DepthOfViewToggle';
import { HistoryTrackToggle } from './HistoryTrackToggle';
import { onRangeInputWheel } from './rangeInputWheelGuard';

export function TimeControls() {
  const historyTrack = useHistoryStore((s) => s.historyTrack);
  const scrubNormalized = useObserverStore((s) => s.scrubNormalized);
  const playbackRate = useObserverStore((s) => s.playbackRate);
  const setPlaybackRate = useObserverStore((s) => s.setPlaybackRate);
  const togglePlayback = useObserverStore((s) => s.togglePlayback);
  const temporalExponent = useObserverStore((s) => s.temporalExponent);
  const timeViewMinLog = useObserverStore((s) => s.timeViewMinLog);
  const timeViewMaxLog = useObserverStore((s) => s.timeViewMaxLog);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const setTemporalExponent = useObserverStore((s) => s.setTemporalExponent);
  const isFlying = useHistoryStore((s) => s.isFlying);

  const scrubbing = useRef(false);
  const anchorTime = useRef(simTimeSeconds);

  const timeWindow = computeEffectiveTimeWindow(
    spatialExponent,
    simTimeSeconds,
    temporalExponent,
    storedTimeWindowOptions(timeViewMinLog, timeViewMaxLog),
  );

  const normalized = normalizedFromSimTimeWindow(simTimeSeconds, timeWindow);
  const viewLogSpan = yearsAgoLogSpan(timeWindow.viewMinSeconds, timeWindow.viewMaxSeconds);
  const fullLogSpan = bandLogSpan(timeWindow);
  const narrowed = isEffectiveWindowNarrowed(timeWindow);
  const temporalBand = getTemporalBand(simTimeSeconds);
  const viewMinLabel = formatSimTimeWindowEdge(
    timeWindow.viewMinSeconds,
    viewLogSpan,
    fullLogSpan,
  );
  const viewMaxLabel = formatSimTimeWindowEdge(
    timeWindow.viewMaxSeconds,
    viewLogSpan,
    fullLogSpan,
  );
  const timelineHeader = formatTimelineHeader(
    timeWindow.viewMinSeconds,
    timeWindow.viewMaxSeconds,
    viewLogSpan,
    fullLogSpan,
  );
  const atHumanScale = isHumanSpatialBand(spatialExponent);
  const showSpiritual = historyTrack === 'spiritual' && atHumanScale;
  const playheadLabel = formatPlayheadTime(
    simTimeSeconds,
    viewLogSpan,
    isInHumanEra(simTimeSeconds),
  );

  const handleScrub = useCallback(
    (clientX: number, rect: DOMRect) => {
      const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      scrubNormalized(t, anchorTime.current);
    },
    [scrubNormalized],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFlying) return;
    scrubbing.current = true;
    anchorTime.current = simTimeSeconds;
    e.currentTarget.setPointerCapture(e.pointerId);
    handleScrub(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbing.current) return;
    handleScrub(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    scrubbing.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={`time-controls ui-panel${isFlying ? ' time-controls--locked' : ''}`}>
      <div className="time-controls-header">
        <span data-testid="timeline-header">
          Timeline · {temporalBand.label} · {timelineHeader}
        </span>
        <HistoryTrackToggle />
        {showSpiritual && <DepthOfViewToggle />}
        <span className="time-hint">
          {showSpiritual
            ? 'Click timeline dots · toggle Full Depth for esoteric'
            : narrowed
              ? 'Log scale (years ago) · zoomed in — Shift+scroll to pan time'
              : 'Scroll or [ ] to zoom space · Shift+scroll or Shift+[ ] for time'}
        </span>
      </div>

      <div className="scrubber-wrap">
        <span className="scrubber-rail-label" data-testid="timeline-playhead-label">
          {showSpiritual ? 'Spiritual' : playheadLabel}
        </span>
        <span className="scrubber-end-label" title={viewMinLabel} data-testid="timeline-min" data-seconds={timeWindow.viewMinSeconds}>
          {viewMinLabel}
        </span>
        <div className="scrubber-track-outer">
          {showSpiritual ? <SpiritualTimelineTicks /> : <TimelineEventTicks />}
          <div
            className="scrubber-track"
            data-testid="scrubber-track"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="scrubber-fill" style={{ width: `${normalized * 100}%` }} />
            <div
              className="scrubber-thumb"
              data-testid="timeline-playhead"
              data-seconds={simTimeSeconds}
              data-normalized={normalized}
              style={{ left: `${normalized * 100}%` }}
            />
          </div>
        </div>
        <span
          className="scrubber-end-label scrubber-end-label--max"
          title={viewMaxLabel}
          data-testid="timeline-max"
          data-seconds={timeWindow.viewMaxSeconds}
        >
          {viewMaxLabel}
        </span>
      </div>

      <div className="time-controls-row">
        <label className="temporal-zoom-label">
          <span className="temporal-zoom-heading">Time zoom</span>
          <input
            data-testid="temporal-zoom"
            type="range"
            min={TEMPORAL_MIN}
            max={TEMPORAL_MAX}
            step={0.05}
            value={temporalExponent}
            onChange={(e) => setTemporalExponent(parseFloat(e.target.value))}
            onWheel={onRangeInputWheel}
          />
          <span className="temporal-zoom-value" data-testid="temporal-zoom-value">
            {temporalExponent.toFixed(1)}
          </span>
          <span className="temporal-zoom-hint">
            {narrowed ? 'Narrow window' : temporalExponent < 1 ? 'Drag right to zoom in' : 'Wide window'}
          </span>
        </label>

        <div className="playback-controls">
          <button
            type="button"
            className={playbackRate !== 0 ? 'active' : ''}
            onClick={togglePlayback}
            aria-label={playbackRate === 0 ? 'Play' : 'Pause'}
          >
            {playbackRate === 0 ? '▶' : '⏸'}
          </button>
          {PLAYBACK_PRESETS.filter((r) => r > 0).map((rate) => (
            <button
              key={rate}
              type="button"
              className={playbackRate === rate ? 'active' : ''}
              onClick={() => setPlaybackRate(rate)}
            >
              {rate}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
