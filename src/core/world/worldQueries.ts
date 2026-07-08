import type { SpiritualTradition } from '../../data/history/types';
import { getPuzzleById } from '../../data/ages/index';
import type { PuzzleTemplate } from '../../data/ages/types';
import { getActiveAgeDefinition } from './WorldRegistry';
import type { EntityInstance, WorldId, WorldLayer } from './types';
import { useWorldStore, isAgeUnlocked as isAgeUnlockedFromState } from './WorldState';

export interface SiteMarkerView {
  entityId: string;
  eventId: string;
  position: [number, number];
  label: string;
}

export function getCurrentWorldId(): WorldId {
  return useWorldStore.getState().currentWorldId;
}

export function isAgeInitiated(worldId?: WorldId): boolean {
  return useWorldStore.getState().isAgeInitiated(worldId);
}

export function getNearestActor(
  x: number,
  z: number,
  maxDistance = 3.5,
): EntityInstance | undefined {
  const worldId = getCurrentWorldId();
  let best: EntityInstance | undefined;
  let bestDist = maxDistance;
  for (const e of useWorldStore.getState().entities) {
    if (e.worldId !== worldId || e.kind !== 'actor') continue;
    const dx = e.transform.x - x;
    const dz = e.transform.z - z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < bestDist) {
      bestDist = d;
      best = e;
    }
  }
  return best;
}

export function getCurrentAgeMarkers(): SiteMarkerView[] {
  const worldId = getCurrentWorldId();
  if (!isAgeInitiated(worldId)) return [];
  const age = getActiveAgeDefinition(worldId);
  const state = useWorldStore.getState();
  return state.entities
    .filter(
      (e) =>
        e.worldId === worldId &&
        e.kind === 'marker' &&
        e.layer === 'material' &&
        state.isMarkerVisible(e.id),
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

export function getNearestPuzzleMechanism(
  x: number,
  z: number,
  opts?: {
    type?: PuzzleTemplate['type'];
    maxDistance?: number;
    includeCompleted?: boolean;
  },
): EntityInstance | undefined {
  const maxDistance = opts?.maxDistance ?? 5;
  const worldId = getCurrentWorldId();
  let best: EntityInstance | undefined;
  let bestDist = maxDistance;
  for (const entity of useWorldStore.getState().entities) {
    if (entity.worldId !== worldId || entity.kind !== 'puzzle-mechanism') continue;
    if (!opts?.includeCompleted && entity.state.completed === true) continue;
    const template = getPuzzleById(entity.defId);
    if (opts?.type && template?.type !== opts.type) continue;
    const dx = entity.transform.x - x;
    const dz = entity.transform.z - z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < bestDist) {
      bestDist = dist;
      best = entity;
    }
  }
  return best;
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
  return isAgeUnlockedFromState(ageId);
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
