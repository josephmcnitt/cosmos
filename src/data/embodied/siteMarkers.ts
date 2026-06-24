import type { SpiritualTradition } from '../history/types';

export interface SiteMarker {
  eventId: string;
  position: [number, number];
  label: string;
}

/** Esoteric mysteries placed on the walkable site (XZ plane). */
export const SITE_MARKERS: SiteMarker[] = [
  {
    eventId: 'platonic-academy-esoteric',
    position: [7, 4],
    label: 'Unwritten doctrines',
  },
  {
    eventId: 'hermetic-corpus',
    position: [5, -5],
    label: 'Hermetic Corpus',
  },
  {
    eventId: 'gnostic-gospels',
    position: [-6, -4],
    label: 'Gnostic texts',
  },
  {
    eventId: 'neoplatonism-plotinus',
    position: [-2, 7],
    label: 'Plotinus — The One',
  },
  {
    eventId: 'zohar',
    position: [0, -8],
    label: 'The Zohar',
  },
];

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
  return SITE_MARKERS.find((m) => m.eventId === eventId);
}

export function getNearestSiteMarker(
  x: number,
  z: number,
  maxDistance = 2.2,
): SiteMarker | undefined {
  let best: SiteMarker | undefined;
  let bestDist = maxDistance;
  for (const marker of SITE_MARKERS) {
    const dx = marker.position[0] - x;
    const dz = marker.position[1] - z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < bestDist) {
      bestDist = d;
      best = marker;
    }
  }
  return best;
}
