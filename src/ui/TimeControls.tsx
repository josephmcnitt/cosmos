import { useCallback, useRef } from 'react';
import { PLAYBACK_PRESETS } from '../core/SimulationClock';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import {
  normalizedFromSimTimeWindow,
  computeEffectiveTimeWindow,
  isHumanSpatialBand,
} from '../core/spatialTimeCoupling';
import { TEMPORAL_MAX, TEMPORAL_MIN, formatSimTimeWindowEdge, getTemporalBand } from '../core/TimeSpace';
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
  );

  const normalized = normalizedFromSimTimeWindow(simTimeSeconds, timeWindow);

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

  const zoomedIn = temporalExponent > TEMPORAL_MAX * 0.35;
  const viewLogSpan = timeWindow.viewMaxLog - timeWindow.viewMinLog;
  const temporalBand = getTemporalBand(simTimeSeconds);
  const viewMinLabel = formatSimTimeWindowEdge(timeWindow.viewMinSeconds, viewLogSpan);
  const viewMaxLabel = formatSimTimeWindowEdge(timeWindow.viewMaxSeconds, viewLogSpan);
  const atHumanScale = isHumanSpatialBand(spatialExponent);
  const showSpiritual = historyTrack === 'spiritual' && atHumanScale;

  return (
    <div className={`time-controls ui-panel${isFlying ? ' time-controls--locked' : ''}`}>
      <div className="time-controls-header">
        <span>
          Timeline · {temporalBand.label}
          {zoomedIn ? ` · ${viewMinLabel} – ${viewMaxLabel}` : ''}
        </span>
        <HistoryTrackToggle />
        {showSpiritual && <DepthOfViewToggle />}
        <span className="time-hint">
          {showSpiritual
            ? 'Click timeline dots · toggle Full Depth for esoteric'
            : zoomedIn
              ? 'Log scale · zoomed in — lower time zoom to widen'
              : 'Click timeline dots · scroll to zoom space & time'}
        </span>
      </div>

      <div className="scrubber-wrap">
        <span className="scrubber-rail-label">
          {showSpiritual ? 'Spiritual' : 'Material'}
        </span>
        <span className="scrubber-end-label" title={viewMinLabel}>
          {viewMinLabel}
        </span>
        <div className="scrubber-track-outer">
          {showSpiritual ? <SpiritualTimelineTicks /> : <TimelineEventTicks />}
          <div
            className="scrubber-track"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="scrubber-fill" style={{ width: `${normalized * 100}%` }} />
            <div className="scrubber-thumb" style={{ left: `${normalized * 100}%` }} />
          </div>
        </div>
        <span className="scrubber-end-label" title={viewMaxLabel}>
          {viewMaxLabel}
        </span>
      </div>

      <div className="time-controls-row">
        <label className="temporal-zoom-label">
          Time zoom
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
