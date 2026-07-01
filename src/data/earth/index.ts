import { MEDITERRANEAN_PACK } from './mediterranean300bce';
import {
  findNearestSite,
  getSiteAnchorsAtTime,
  resolvePolitiesAtTime,
} from '../../core/earth/polityTime';
import type { PolityPack, SiteAnchor } from './types';

export const ACTIVE_EARTH_PACK: PolityPack = MEDITERRANEAN_PACK;

export function getPolitiesAtTime(simTimeSeconds: number) {
  return resolvePolitiesAtTime(ACTIVE_EARTH_PACK.snapshots, simTimeSeconds);
}

export function getSiteAnchorsAtTimeForPack(simTimeSeconds: number): SiteAnchor[] {
  return getSiteAnchorsAtTime(ACTIVE_EARTH_PACK.sites, simTimeSeconds);
}

export function resolveSiteAt(
  lat: number,
  lng: number,
  simTimeSeconds: number,
): SiteAnchor | null {
  return findNearestSite(ACTIVE_EARTH_PACK.sites, lat, lng, simTimeSeconds);
}

export type { GeoAnchor, PolityKind, PolityPack, PolitySnapshot, ResolvedPolity, SiteAnchor } from './types';
