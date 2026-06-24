import { getSpatialBand, SPATIAL_BANDS } from '../../core/ScaleSpace';
import { eventBelongsToSpatialBand } from '../../core/spatialTimeCoupling';
import {
  getCrossLinks as getSpiritualCrossLinks,
  getSpiritualEventsInWindow,
  SPIRITUAL_EVENTS,
} from '../spiritual/index';
import { BIOLOGIC_EVENTS } from './biologic';
import { COSMIC_EVENTS } from './cosmic';
import { GEOLOGIC_EVENTS } from './geologic';
import { HUMAN_EVENTS } from './human';
import type {
  DepthOfView,
  HistoryDomain,
  MaterialEvent,
  SpiritualTradition,
  TimelineEvent,
} from './types';

export type { TimelineEvent, MaterialEvent, SpiritualEvent } from './types';
export { DOMAIN_LABELS, TRADITION_LABELS, isMaterialEvent, isSpiritualEvent } from './types';

/** @deprecated Use MaterialEvent or TimelineEvent */
export type HistoryEvent = MaterialEvent;

export const HISTORY_EVENTS: MaterialEvent[] = [
  ...COSMIC_EVENTS,
  ...GEOLOGIC_EVENTS,
  ...BIOLOGIC_EVENTS,
  ...HUMAN_EVENTS,
].sort((a, b) => a.simTimeSeconds - b.simTimeSeconds);

export const ALL_TIMELINE_EVENTS: TimelineEvent[] = [
  ...HISTORY_EVENTS,
  ...SPIRITUAL_EVENTS,
].sort((a, b) => a.simTimeSeconds - b.simTimeSeconds);

export function getEventById(id: string): TimelineEvent | undefined {
  return ALL_TIMELINE_EVENTS.find((e) => e.id === id);
}

export function getMaterialEventById(id: string): MaterialEvent | undefined {
  return HISTORY_EVENTS.find((e) => e.id === id);
}

export function getEventsInTimeWindow(
  centerSeconds: number,
  halfWidthSeconds: number,
): MaterialEvent[] {
  const min = centerSeconds - halfWidthSeconds;
  const max = centerSeconds + halfWidthSeconds;
  return HISTORY_EVENTS.filter(
    (e) => e.simTimeSeconds >= min && e.simTimeSeconds <= max,
  );
}

export function getEventsByDomain(domain: HistoryDomain | 'all'): MaterialEvent[] {
  if (domain === 'all') return HISTORY_EVENTS;
  return HISTORY_EVENTS.filter((e) => e.domain === domain);
}

export function isEventAtVisibleScale(
  event: TimelineEvent,
  spatialExponent: number,
): boolean {
  if (!event.spatialBand) return true;
  const current = getSpatialBand(spatialExponent);
  if (current.id === event.spatialBand) return true;
  const target = SPATIAL_BANDS.find((b) => b.id === event.spatialBand);
  if (!target) return true;
  return (
    spatialExponent >= target.minExponent - 1 &&
    spatialExponent <= target.maxExponent + 1
  );
}

export function getAdjacentEvent(
  currentId: string,
  direction: 'prev' | 'next',
): MaterialEvent | undefined {
  const idx = HISTORY_EVENTS.findIndex((e) => e.id === currentId);
  if (idx < 0) return undefined;
  const nextIdx = direction === 'next' ? idx + 1 : idx - 1;
  return HISTORY_EVENTS[nextIdx];
}

export function getAdjacentTimelineEvent(
  currentId: string,
  direction: 'prev' | 'next',
  options: {
    spatialExponent: number;
    viewMinSeconds: number;
    viewMaxSeconds: number;
    domainFilter: HistoryDomain | 'all';
    traditionFilter: SpiritualTradition | 'all';
    depthOfView: DepthOfView;
    historyTrack?: 'material' | 'spiritual';
  },
): TimelineEvent | undefined {
  const visible = getVisibleTimelineEvents(options);
  const idx = visible.findIndex((e) => e.id === currentId);
  if (idx < 0) return undefined;
  const nextIdx = direction === 'next' ? idx + 1 : idx - 1;
  return visible[nextIdx];
}

export function getVisibleTimelineEvents(options: {
  spatialExponent: number;
  viewMinSeconds: number;
  viewMaxSeconds: number;
  domainFilter: HistoryDomain | 'all';
  traditionFilter: SpiritualTradition | 'all';
  depthOfView: DepthOfView;
  historyTrack?: 'material' | 'spiritual';
}): TimelineEvent[] {
  const material = getEventsInEffectiveWindow(
    options.spatialExponent,
    options.viewMinSeconds,
    options.viewMaxSeconds,
  ).filter((e) => options.domainFilter === 'all' || e.domain === options.domainFilter);

  const spiritual = getSpiritualEventsInWindow(
    options.spatialExponent,
    options.viewMinSeconds,
    options.viewMaxSeconds,
    options.depthOfView,
    options.traditionFilter,
  );

  if (options.historyTrack === 'material') return material;
  if (options.historyTrack === 'spiritual') return spiritual;

  return [...material, ...spiritual].sort((a, b) => a.simTimeSeconds - b.simTimeSeconds);
}

export function getNearestEvent(simTimeSeconds: number): TimelineEvent | undefined {
  if (ALL_TIMELINE_EVENTS.length === 0) return undefined;
  let best = ALL_TIMELINE_EVENTS[0]!;
  let bestDist = Math.abs(best.simTimeSeconds - simTimeSeconds);
  for (const e of ALL_TIMELINE_EVENTS) {
    const d = Math.abs(e.simTimeSeconds - simTimeSeconds);
    if (d < bestDist) {
      bestDist = d;
      best = e;
    }
  }
  return best;
}

export function getNearestEventForBand(
  simTimeSeconds: number,
  spatialExponent: number,
): TimelineEvent | undefined {
  const band = getSpatialBand(spatialExponent);
  const candidates = ALL_TIMELINE_EVENTS.filter((e) =>
    eventBelongsToSpatialBand(e, band.id),
  );
  if (candidates.length === 0) return getNearestEvent(simTimeSeconds);

  let best = candidates[0]!;
  let bestDist = Math.abs(best.simTimeSeconds - simTimeSeconds);
  for (const e of candidates) {
    const d = Math.abs(e.simTimeSeconds - simTimeSeconds);
    if (d < bestDist) {
      bestDist = d;
      best = e;
    }
  }
  return best;
}

export function getEventsWith3DMarkers(): MaterialEvent[] {
  return HISTORY_EVENTS.filter((e) => e.show3DMarker);
}

export function getEventsInEffectiveWindow(
  spatialExponent: number,
  viewMinSeconds: number,
  viewMaxSeconds: number,
): MaterialEvent[] {
  const band = getSpatialBand(spatialExponent);
  return HISTORY_EVENTS.filter((e) => {
    if (e.simTimeSeconds < viewMinSeconds || e.simTimeSeconds > viewMaxSeconds) {
      return false;
    }
    return eventBelongsToSpatialBand(e, band.id);
  });
}

export function getCrossLinks(eventId: string) {
  return getSpiritualCrossLinks(eventId, ALL_TIMELINE_EVENTS);
}

export { COSMIC_EVENTS, GEOLOGIC_EVENTS, BIOLOGIC_EVENTS, HUMAN_EVENTS };
export { SPIRITUAL_EVENTS, getHiddenEsotericCount } from '../spiritual/index';
