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
  scetes: {
    lat: 30.3532,
    lng: 30.5623,
    label: 'Scetes — Egyptian Desert',
  },
  constantinople: {
    lat: 41.0082,
    lng: 28.9784,
    label: 'Constantinople',
  },
  cordoba: {
    lat: 37.8882,
    lng: -4.7794,
    label: 'Córdoba',
  },
  safed: {
    lat: 32.9646,
    lng: 35.496,
    label: 'Safed — Galilee',
  },
  cologne: {
    lat: 50.9375,
    lng: 6.9603,
    label: 'Cologne',
  },
} as const;

export type EarthSiteId = keyof typeof EARTH_SITE_COORDS;
