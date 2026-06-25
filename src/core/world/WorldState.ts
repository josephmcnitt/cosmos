import { create } from 'zustand';
import type { SpiritualTradition } from '../../data/history/types';
import { clampResonance, computeSpiritualDepth, dominantTradition } from '../practice';
import { applySnapshot, createDefaultSnapshot } from '../save/migrations';
import { exportSnapshot, loadSave, saveGame } from '../save/saveGame';
import type { PersistedWorldSnapshot } from '../save/saveSchema';
import { worldEvents } from './WorldEvents';
import { worldRegistry } from './WorldRegistry';
import type {
  EntanglementPair,
  EntityInstance,
  JournalEntry,
  PlacedStructureBlueprint,
  SimInstance,
  WorldLayer,
} from './types';

interface WorldState {
  hydrated: boolean;
  currentWorldId: string;
  unlockedWorldIds: string[];
  visitedWorldIds: string[];
  worldLayers: Record<string, WorldLayer>;
  discoveredEventIds: string[];
  resonance: Partial<Record<SpiritualTradition, number>>;
  sessionsCompleted: number;
  entities: EntityInstance[];
  completedPuzzleIds: string[];
  puzzleState: Record<string, Record<string, unknown>>;
  simInstances: SimInstance[];
  entanglements: EntanglementPair[];
  journal: JournalEntry[];
  eraWitnessFlags: string[];
  lastSimTickMs: number;
  ageTransitionActive: boolean;
  controlFocus: 'material' | 'astral';
  pendingBlueprints: PlacedStructureBlueprint[];

  spiritualDepth: number;
  dominantTradition: SpiritualTradition | null;

  hydrate: () => void;
  persist: () => void;
  markEventDiscovered: (eventId: string, entityId?: string) => void;
  isEventDiscovered: (eventId: string) => boolean;
  addResonance: (tradition: SpiritualTradition, amount: number) => void;
  setResonance: (resonance: Partial<Record<SpiritualTradition, number>>) => void;
  incrementSessions: () => void;
  travelToWorld: (worldId: string) => boolean;
  setWorldLayer: (worldId: string, layer: WorldLayer) => void;
  getWorldLayer: (worldId?: string) => WorldLayer;
  updateEntity: (entityId: string, patch: Partial<EntityInstance> | ((e: EntityInstance) => EntityInstance)) => void;
  completePuzzle: (puzzleId: string) => void;
  isPuzzleCompleted: (puzzleId: string) => boolean;
  setPuzzleState: (puzzleId: string, state: Record<string, unknown>) => void;
  unlockPortal: (portalId: string) => void;
  markEraWitnessed: (eventId: string) => void;
  hasEraWitnessed: (eventId: string) => boolean;
  addJournalEntry: (title: string, body: string) => void;
  setAgeTransitionActive: (active: boolean) => void;
  setControlFocus: (focus: 'material' | 'astral') => void;
  setPendingBlueprints: (blueprints: PlacedStructureBlueprint[]) => void;
  addSimInstance: (instance: SimInstance) => void;
  removeSimInstance: (id: string) => void;
  updateSimInstance: (id: string, patch: Partial<SimInstance>) => void;
  addEntanglement: (pair: EntanglementPair) => void;
  removeEntanglement: (id: string) => void;
  updateEntanglement: (id: string, patch: Partial<EntanglementPair>) => void;
  applySnapshotData: (snapshot: PersistedWorldSnapshot) => void;
}

function syncDepth(resonance: Partial<Record<SpiritualTradition, number>>) {
  return {
    spiritualDepth: computeSpiritualDepth(resonance),
    dominantTradition: dominantTradition(resonance),
  };
}

function unlockAgeForPortal(targetAgeId: string, unlocked: string[]): string[] {
  if (unlocked.includes(targetAgeId)) return unlocked;
  return [...unlocked, targetAgeId];
}

export const useWorldStore = create<WorldState>((set, get) => ({
  ...(() => {
    const snap = createDefaultSnapshot();
    return {
      hydrated: false,
      currentWorldId: snap.currentWorldId,
      unlockedWorldIds: snap.unlockedWorldIds,
      visitedWorldIds: snap.visitedWorldIds,
      worldLayers: snap.worldLayers,
      discoveredEventIds: snap.discoveredEventIds,
      resonance: snap.resonance as Partial<Record<SpiritualTradition, number>>,
      sessionsCompleted: snap.sessionsCompleted,
      entities: snap.entities,
      completedPuzzleIds: snap.completedPuzzleIds,
      puzzleState: snap.puzzleState,
      simInstances: snap.simInstances,
      entanglements: snap.entanglements,
      journal: snap.journal,
      eraWitnessFlags: snap.eraWitnessFlags,
      lastSimTickMs: snap.lastSimTickMs,
      ageTransitionActive: false,
      controlFocus: 'material' as const,
      pendingBlueprints: [],
      ...syncDepth(snap.resonance as Partial<Record<SpiritualTradition, number>>),
    };
  })(),

  hydrate: () => {
    const saved = loadSave();
    if (saved) {
      get().applySnapshotData(applySnapshot(saved));
    }
    set({ hydrated: true });
  },

  persist: () => {
    if (!get().hydrated) return;
    saveGame(exportSnapshot(get()));
  },

  applySnapshotData: (snapshot) => {
    set({
      currentWorldId: snapshot.currentWorldId,
      unlockedWorldIds: snapshot.unlockedWorldIds,
      visitedWorldIds: snapshot.visitedWorldIds,
      worldLayers: snapshot.worldLayers,
      discoveredEventIds: snapshot.discoveredEventIds,
      resonance: snapshot.resonance as Partial<Record<SpiritualTradition, number>>,
      sessionsCompleted: snapshot.sessionsCompleted,
      entities: snapshot.entities,
      completedPuzzleIds: snapshot.completedPuzzleIds,
      puzzleState: snapshot.puzzleState,
      simInstances: snapshot.simInstances,
      entanglements: snapshot.entanglements,
      journal: snapshot.journal,
      eraWitnessFlags: snapshot.eraWitnessFlags,
      lastSimTickMs: snapshot.lastSimTickMs,
      ...syncDepth(snapshot.resonance as Partial<Record<SpiritualTradition, number>>),
    });
  },

  markEventDiscovered: (eventId, entityId) => {
    set((s) => {
      const discoveredEventIds = s.discoveredEventIds.includes(eventId)
        ? s.discoveredEventIds
        : [...s.discoveredEventIds, eventId];
      const entities = s.entities.map((e) => {
        if (entityId && e.id === entityId) {
          return { ...e, state: { ...e.state, discovered: true } };
        }
        if (e.kind === 'marker' && e.defId === eventId) {
          return { ...e, state: { ...e.state, discovered: true } };
        }
        return e;
      });
      return { discoveredEventIds, entities };
    });
    worldEvents.emit({ type: 'entity/discovered', entityId: entityId ?? eventId, eventId });
    get().persist();
  },

  isEventDiscovered: (eventId) => get().discoveredEventIds.includes(eventId),

  addResonance: (tradition, amount) => {
    set((s) => {
      const prev = s.resonance[tradition] ?? 0;
      const resonance = {
        ...s.resonance,
        [tradition]: clampResonance(prev + amount),
      };
      return { resonance, ...syncDepth(resonance) };
    });
    get().persist();
  },

  setResonance: (resonance) => {
    set({ resonance, ...syncDepth(resonance) });
  },

  incrementSessions: () => {
    set((s) => ({ sessionsCompleted: s.sessionsCompleted + 1 }));
    get().persist();
  },

  travelToWorld: (worldId) => {
    const age = worldRegistry.getAge(worldId);
    if (!age) return false;
    if (!isAgeUnlockedInternal(get(), worldId)) return false;

    const from = get().currentWorldId;
    set((s) => ({
      currentWorldId: worldId,
      visitedWorldIds: s.visitedWorldIds.includes(worldId)
        ? s.visitedWorldIds
        : [...s.visitedWorldIds, worldId],
      unlockedWorldIds: unlockAgeForPortal(worldId, s.unlockedWorldIds),
    }));
    worldEvents.emit({ type: 'world/traveled', fromWorldId: from, toWorldId: worldId });
    get().persist();
    return true;
  },

  setWorldLayer: (worldId, layer) => {
    set((s) => ({
      worldLayers: { ...s.worldLayers, [worldId]: layer },
    }));
    get().persist();
  },

  getWorldLayer: (worldId) => {
    const id = worldId ?? get().currentWorldId;
    return get().worldLayers[id] ?? 'material';
  },

  updateEntity: (entityId, patch) => {
    set((s) => ({
      entities: s.entities.map((e) => {
        if (e.id !== entityId) return e;
        return typeof patch === 'function' ? patch(e) : { ...e, ...patch };
      }),
    }));
    get().persist();
  },

  completePuzzle: (puzzleId) => {
    if (get().completedPuzzleIds.includes(puzzleId)) return;
    const template = worldRegistry.puzzleTemplates.get(puzzleId);
    set((s) => {
      let unlockedWorldIds = s.unlockedWorldIds;
      let entities = s.entities;
      if (template?.targetAgeId) {
        unlockedWorldIds = unlockAgeForPortal(template.targetAgeId, unlockedWorldIds);
      }
      entities = entities.map((e) => {
        if (e.kind === 'portal' && e.state.puzzleId === puzzleId) {
          return { ...e, state: { ...e.state, unlocked: true } };
        }
        if (e.kind === 'puzzle-mechanism' && e.defId === puzzleId) {
          return { ...e, state: { ...e.state, completed: true } };
        }
        return e;
      });
      const completedPuzzleIds = s.completedPuzzleIds.includes(puzzleId)
        ? s.completedPuzzleIds
        : [...s.completedPuzzleIds, puzzleId];
      return { completedPuzzleIds, unlockedWorldIds, entities };
    });
    worldEvents.emit({ type: 'puzzle/completed', puzzleId });
    if (template?.targetAgeId) {
      worldEvents.emit({
        type: 'portal/unlocked',
        portalId: puzzleId,
        targetAgeId: template.targetAgeId,
      });
    }
    get().persist();
  },

  isPuzzleCompleted: (puzzleId) => get().completedPuzzleIds.includes(puzzleId),

  setPuzzleState: (puzzleId, state) => {
    set((s) => ({
      puzzleState: { ...s.puzzleState, [puzzleId]: state },
    }));
    get().persist();
  },

  unlockPortal: (portalId) => {
    get().updateEntity(portalId, (e) => ({
      ...e,
      state: { ...e.state, unlocked: true },
    }));
    const portal = get().entities.find((e) => e.id === portalId);
    if (portal?.kind === 'portal') {
      worldEvents.emit({
        type: 'portal/unlocked',
        portalId,
        targetAgeId: portal.defId,
      });
    }
  },

  markEraWitnessed: (eventId) => {
    set((s) => ({
      eraWitnessFlags: s.eraWitnessFlags.includes(eventId)
        ? s.eraWitnessFlags
        : [...s.eraWitnessFlags, eventId],
    }));
    get().persist();
  },

  hasEraWitnessed: (eventId) => get().eraWitnessFlags.includes(eventId),

  addJournalEntry: (title, body) => {
    set((s) => ({
      journal: [
        ...s.journal,
        { id: `journal-${Date.now()}`, title, body, at: Date.now() },
      ],
    }));
    get().persist();
  },

  setAgeTransitionActive: (active) => set({ ageTransitionActive: active }),

  setControlFocus: (focus) => set({ controlFocus: focus }),

  setPendingBlueprints: (blueprints) => set({ pendingBlueprints: blueprints }),

  addSimInstance: (instance) => {
    set((s) => ({ simInstances: [...s.simInstances, instance] }));
    get().persist();
  },

  removeSimInstance: (id) => {
    set((s) => ({ simInstances: s.simInstances.filter((i) => i.id !== id) }));
    get().persist();
  },

  updateSimInstance: (id, patch) => {
    set((s) => ({
      simInstances: s.simInstances.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
    get().persist();
  },

  addEntanglement: (pair) => {
    set((s) => ({ entanglements: [...s.entanglements, pair] }));
    get().persist();
  },

  removeEntanglement: (id) => {
    set((s) => ({ entanglements: s.entanglements.filter((p) => p.id !== id) }));
    get().persist();
  },

  updateEntanglement: (id, patch) => {
    set((s) => ({
      entanglements: s.entanglements.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    get().persist();
  },
}));

function isAgeUnlockedInternal(
  state: Pick<WorldState, 'unlockedWorldIds' | 'completedPuzzleIds'>,
  ageId: string,
): boolean {
  if (state.unlockedWorldIds.includes(ageId)) return true;
  const age = worldRegistry.getAge(ageId);
  if (!age?.unlock?.requiresPuzzleIds) return ageId === 'grove';
  return age.unlock.requiresPuzzleIds.every((pid) => state.completedPuzzleIds.includes(pid));
}

export function isAgeUnlocked(ageId: string): boolean {
  return isAgeUnlockedInternal(useWorldStore.getState(), ageId);
}
