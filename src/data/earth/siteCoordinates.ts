/** WGS84 coordinates for playable earth sites — single source for ages + globe pins. */
export const EARTH_SITE_COORDS = {
  athens: {
    lat: 37.9838,
    lng: 23.7275,
    label: "Athens — Plato's Grove",
  },
  alexandria: {
    lat: 31.2001,
    lng: 29.9187,
    label: 'Alexandria',
  },
  rome: {
    lat: 41.9028,
    lng: 12.4964,
    label: 'Rome',
  },
} as const;

export type EarthSiteId = keyof typeof EARTH_SITE_COORDS;
