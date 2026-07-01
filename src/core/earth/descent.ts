import { getAgeById } from '../../data/ages';
import { ACTIVE_EARTH_PACK } from '../../data/earth';
import { isAgeUnlocked, useWorldStore } from '../world/WorldState';
import type { GeoFocus } from './earthMode';

export interface EarthDescentEligibility {
  canDescend: boolean;
  reason?: string;
}

export function getEarthDescentEligibility(
  geoFocus: GeoFocus | null,
  simTimeSeconds: number,
): EarthDescentEligibility {
  if (!geoFocus?.ageId) {
    return { canDescend: false, reason: 'No playable age at this location.' };
  }

  const site = geoFocus.siteAnchorId
    ? ACTIVE_EARTH_PACK.sites.find((s) => s.id === geoFocus.siteAnchorId)
    : undefined;
  if (
    site &&
    (simTimeSeconds < site.simTimeStart || simTimeSeconds > site.simTimeEnd)
  ) {
    return { canDescend: false, reason: 'Scrub the timeline to when this site exists.' };
  }

  const age = getAgeById(geoFocus.ageId);
  if (!age) {
    return { canDescend: false, reason: 'Age not found.' };
  }

  if (age.playableWindow) {
    const { start, end } = age.playableWindow;
    if (simTimeSeconds < start || simTimeSeconds > end) {
      return { canDescend: false, reason: 'Scrub the timeline to when this age is active.' };
    }
  }

  const world = useWorldStore.getState();
  if (world.getInitiationStatus('grove') !== 'completed' && geoFocus.ageId !== 'grove') {
    return { canDescend: false, reason: "Complete Plato's Grove initiation first." };
  }

  if (!isAgeUnlocked(geoFocus.ageId)) {
    return { canDescend: false, reason: 'Unlock this age on the path before descending.' };
  }

  return { canDescend: true };
}
