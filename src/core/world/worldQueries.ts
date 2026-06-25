import type { SpiritualTradition } from '../../data/history/types';
import { getActiveAgeDefinition, worldRegistry } from './WorldRegistry';
import type { EntityInstance, WorldId, WorldLayer } from './types';
import { useWorldStore } from './WorldState';

export interface SiteMarkerView {
  entityId: string;
  eventId: string;
  position: [number, number];
  label: string;
}

export function getCurrentWorldId(): WorldId {
  return useWorldStore.getState().currentWorldId;
}

export function getCurrentAgeMarkers(): SiteMarkerView[] {
  const worldId = getCurrentWorldId();
  const age = getActiveAgeDefinition(worldId);
  return useWorldStore
    .getState()
    .entities.filter(
      (e) => e.worldId === worldId && e.kind === 'marker' && e.layer === 'material',
    )
    .map((e) => {
      const def = age.markers.find((m) => m.id === e.id);
      return {
        entityId: e.id,
        eventId: e.defId,
        position: [e.transform.x, e.transform.z] as [number, number],
        label: (e.state.label as string) ?? def?.label ?? e.defId,
      };
    });
}

export function getNearestMarker(
  x: number,
  z: number,
  maxDistance = 3.5,
): SiteMarkerView | undefined {
  let best: SiteMarkerView | undefined;
  let bestDist = maxDistance;
  for (const marker of getCurrentAgeMarkers()) {
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

export function getMarkerByEventId(eventId: string): SiteMarkerView | undefined {
  return getCurrentAgeMarkers().find((m) => m.eventId === eventId);
}

export function getTerrainConfig(worldId?: WorldId) {
  const id = worldId ?? getCurrentWorldId();
  return getActiveAgeDefinition(id).terrain;
}

export function getSiteHalfSize(worldId?: WorldId): number {
  return getTerrainConfig(worldId).siteHalfSize;
}

export function getWorldLayer(worldId?: WorldId): WorldLayer {
  const id = worldId ?? getCurrentWorldId();
  return useWorldStore.getState().worldLayers[id] ?? 'material';
}

export function getEntitiesInWorld(
  worldId: WorldId,
  kind?: EntityInstance['kind'],
  layer?: WorldLayer,
): EntityInstance[] {
  return useWorldStore.getState().entities.filter((e) => {
    if (e.worldId !== worldId) return false;
    if (kind && e.kind !== kind) return false;
    if (layer && e.layer !== layer) return false;
    return true;
  });
}

export function isEntityDiscovered(entityId: string): boolean {
  const entity = useWorldStore.getState().entities.find((e) => e.id === entityId);
  return entity?.state.discovered === true;
}

export function isEventDiscovered(eventId: string): boolean {
  return useWorldStore.getState().discoveredEventIds.includes(eventId);
}

export function getUnlockedPortals(worldId: WorldId): EntityInstance[] {
  return getEntitiesInWorld(worldId, 'portal').filter((p) => p.state.unlocked === true);
}

export function isAgeUnlocked(ageId: string): boolean {
  const age = worldRegistry.getAge(ageId);
  if (!age) return false;
  if (!age.unlock) return true;
  const state = useWorldStore.getState();
  if (age.unlock.requiresPuzzleIds?.some((pid) => !state.completedPuzzleIds.includes(pid))) {
    return false;
  }
  return true;
}

export function getDominantTraditionFromResonance(): SpiritualTradition | null {
  const resonance = useWorldStore.getState().resonance;
  let best: SpiritualTradition | null = null;
  let bestVal = 0;
  for (const [key, val] of Object.entries(resonance)) {
    if (val != null && val > bestVal) {
      bestVal = val;
      best = key as SpiritualTradition;
    }
  }
  return best;
}
