import type { DepthOfView, SpiritualEvent, SpiritualTradition, TimelineEvent } from '../history/types';
import { getSpatialBand } from '../../core/ScaleSpace';
import { eventBelongsToSpatialBand } from '../../core/spatialTimeCoupling';
import { ESOTERIC_EVENTS } from './esoteric';
import { EXOTERIC_EVENTS } from './exoteric';

export const SPIRITUAL_EVENTS: SpiritualEvent[] = [...EXOTERIC_EVENTS, ...ESOTERIC_EVENTS].sort(
  (a, b) => a.simTimeSeconds - b.simTimeSeconds,
);

export function getSpiritualEventById(id: string): SpiritualEvent | undefined {
  return SPIRITUAL_EVENTS.find((e) => e.id === id);
}

export function getSpiritualEventsForBand(
  bandId: string,
  depthOfView: DepthOfView,
): SpiritualEvent[] {
  return SPIRITUAL_EVENTS.filter((event) => {
    if (event.visibility === 'esoteric' && depthOfView !== 'full') return false;
    return eventBelongsToSpatialBand(event, bandId);
  });
}

export function getSpiritualEventsByTradition(
  tradition: SpiritualTradition | 'all',
  depthOfView: DepthOfView,
): SpiritualEvent[] {
  let events = SPIRITUAL_EVENTS;
  if (depthOfView !== 'full') {
    events = events.filter((e) => e.visibility === 'exoteric');
  }
  if (tradition === 'all') return events;
  return events.filter((e) => e.tradition === tradition);
}

export function getHiddenEsotericCount(depthOfView: DepthOfView): number {
  if (depthOfView === 'full') return 0;
  return ESOTERIC_EVENTS.length;
}

export interface CrossLinks {
  material: TimelineEvent[];
  spiritual: SpiritualEvent[];
}

export function getCrossLinks(eventId: string, allEvents: TimelineEvent[]): CrossLinks {
  const event = allEvents.find((e) => e.id === eventId);
  if (!event) return { material: [], spiritual: [] };

  const materialIds = new Set<string>();
  const spiritualIds = new Set<string>();

  if (event.track === 'spiritual' && event.relatedMaterialIds) {
    for (const id of event.relatedMaterialIds) materialIds.add(id);
  }
  if (event.track === 'material' && event.relatedSpiritualIds) {
    for (const id of event.relatedSpiritualIds) spiritualIds.add(id);
  }

  for (const e of allEvents) {
    if (e.track === 'spiritual' && e.relatedMaterialIds?.includes(eventId)) {
      spiritualIds.add(e.id);
    }
    if (e.track === 'material' && e.relatedSpiritualIds?.includes(eventId)) {
      materialIds.add(e.id);
    }
  }

  return {
    material: allEvents.filter((e) => e.track === 'material' && materialIds.has(e.id)),
    spiritual: SPIRITUAL_EVENTS.filter((e) => spiritualIds.has(e.id)),
  };
}

export function getSpiritualEventsInWindow(
  spatialExponent: number,
  viewMinSeconds: number,
  viewMaxSeconds: number,
  depthOfView: DepthOfView,
  tradition: SpiritualTradition | 'all',
): SpiritualEvent[] {
  const band = getSpatialBand(spatialExponent);
  return getSpiritualEventsForBand(band.id, depthOfView).filter((e) => {
    if (e.simTimeSeconds < viewMinSeconds || e.simTimeSeconds > viewMaxSeconds) return false;
    if (tradition !== 'all' && e.tradition !== tradition) return false;
    return true;
  });
}

export { EXOTERIC_EVENTS, ESOTERIC_EVENTS };
