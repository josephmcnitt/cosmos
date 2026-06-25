import type { SpiritualTradition } from '../history/types';
import { GROVE_AGE } from '../ages/grove';
import {
  getNearestMarker as getNearestFromWorld,
  getMarkerByEventId as getMarkerFromWorld,
} from '../../core/world/worldQueries';

export interface SiteMarker {
  eventId: string;
  position: [number, number];
  label: string;
}

/** Legacy export — Grove markers for tests. */
export const SITE_MARKERS: SiteMarker[] = GROVE_AGE.markers.map((m) => ({
  eventId: m.eventId,
  position: m.position,
  label: m.label,
}));

export const MARKER_TRADITION_COLORS: Record<SpiritualTradition, string> = {
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

export function getSiteMarkerByEventId(eventId: string): SiteMarker | undefined {
  const m = getMarkerFromWorld(eventId);
  if (!m) return SITE_MARKERS.find((s) => s.eventId === eventId);
  return { eventId: m.eventId, position: m.position, label: m.label };
}

export const MARKER_PRACTICE_RADIUS = 3.5;

export function getNearestSiteMarker(
  x: number,
  z: number,
  maxDistance = MARKER_PRACTICE_RADIUS,
): SiteMarker | undefined {
  const m = getNearestFromWorld(x, z, maxDistance);
  if (!m) return undefined;
  return { eventId: m.eventId, position: m.position, label: m.label };
}
