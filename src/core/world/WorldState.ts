import { create } from 'zustand';
import type { SpiritualTradition } from '../../data/history/types';
import { clampResonance, computeSpiritualDepth, dominantTradition } from '../practice';
import { applySnapshot, createDefaultSnapshot } from '../save/migrations';
import { repairWorldEntities } from './WorldRegistry';
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
import type { ActiveInitiation, InitiationStatus } from '../initiation/types';
import { getInitiationById, getInitiationForWorld, getStep } from '../../data/initiations/index';
import { defaultInitiationStatus } from '../initiation/runInitiation';
import type { ChoiceRecord } from '../../data/progression/types';
import { applyProgressEffects } from '../progression/applyEffects';
import { evaluateProgress } from '../progression/evaluateProgress';
import { buildProgressInputFromWorld } from '../progression/buildProgressInput';

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
  initiationStatus: Record<string, InitiationStatus>;
  activeInitiation: ActiveInitiation | null;
  choiceHistory: ChoiceRecord[];
  completedProgressNodeIds: string[];
  pathFlags: Record<string, string | number | boolean>;
  activePathId?: string;
  revealedMarkerIds: string[];

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
  startInitiation: (initiationId: string) => boolean;
  setInitiationChoice: (choiceId: string) => void;
  advanceInitiationStep: () => void;
  completeInitiation: (worldId: string) => void;
  setInitiationAvailable: (worldId: string) => void;
  getInitiationStatus: (worldId: string) => InitiationStatus;
  isAgeInitiated: (worldId?: string) => boolean;
  cancelInitiation: () => void;
  recordChoice: (initiationId: string, stepIndex: number, choiceId: string) => void;
  reevaluateProgress: () => void;
  isMarkerVisible: (markerId: string) => boolean;
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
      initiationStatus: snap.initiationStatus ?? defaultInitiationStatus(),
      activeInitiation: snap.activeInitiation ?? null,
      choiceHistory: snap.choiceHistory ?? [],
      completedProgressNodeIds: snap.completedProgressNodeIds ?? [],
      pathFlags: snap.pathFlags ?? {},
      activePathId: snap.activePathId,
      revealedMarkerIds: snap.revealedMarkerIds ?? [],
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
      entities: repairWorldEntities(snapshot.entities),
      completedPuzzleIds: snapshot.completedPuzzleIds,
      puzzleState: snapshot.puzzleState,
      simInstances: snapshot.simInstances,
      entanglements: snapshot.entanglements,
      journal: snapshot.journal,
      eraWitnessFlags: snapshot.eraWitnessFlags,
      lastSimTickMs: snapshot.lastSimTickMs,
      initiationStatus: snapshot.initiationStatus ?? defaultInitiationStatus(),
      activeInitiation: snapshot.activeInitiation ?? null,
      choiceHistory: snapshot.choiceHistory ?? [],
      completedProgressNodeIds: snapshot.completedProgressNodeIds ?? [],
      pathFlags: snapshot.pathFlags ?? {},
      activePathId: snapshot.activePathId,
      revealedMarkerIds: snapshot.revealedMarkerIds ?? [],
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
    set((s) => {
      const status = { ...s.initiationStatus };
      if (status[worldId] === 'locked') {
        status[worldId] = 'available';
      }
      return {
        currentWorldId: worldId,
        visitedWorldIds: s.visitedWorldIds.includes(worldId)
          ? s.visitedWorldIds
          : [...s.visitedWorldIds, worldId],
        unlockedWorldIds: unlockAgeForPortal(worldId, s.unlockedWorldIds),
        initiationStatus: status,
        activeInitiation: null,
      };
    });
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

  startInitiation: (initiationId) => {
    const def = getInitiationById(initiationId);
    if (!def) return false;
    const status = get().initiationStatus[def.worldId];
    if (status !== 'available' && status !== 'in_progress') return false;
    set({
      activeInitiation: {
        initiationId,
        stepIndex: 0,
        stepStartedAt: performance.now(),
      },
      initiationStatus: {
        ...get().initiationStatus,
        [def.worldId]: 'in_progress',
      },
    });
    get().persist();
    return true;
  },

  setInitiationChoice: (choiceId) => {
    const active = get().activeInitiation;
    if (!active) return;
    set({
      activeInitiation: { ...active, choiceId, stepStartedAt: performance.now() },
    });
  },

  advanceInitiationStep: () => {
    const active = get().activeInitiation;
    if (!active) return;
    const def = getInitiationById(active.initiationId);
    if (!def) return;

    const currentStep = getStep(def, active.stepIndex);
    if (currentStep?.type === 'choose' && active.choiceId) {
      get().recordChoice(active.initiationId, active.stepIndex, active.choiceId);
    }

    const nextIndex = active.stepIndex + 1;
    if (nextIndex >= def.steps.length) {
      get().completeInitiation(def.worldId);
      return;
    }
    set({
      activeInitiation: {
        initiationId: active.initiationId,
        stepIndex: nextIndex,
        stepStartedAt: performance.now(),
      },
    });
    get().persist();
  },

  completeInitiation: (worldId) => {
    const active = get().activeInitiation;
    if (active) {
      const def = getInitiationById(active.initiationId);
      const step = def ? getStep(def, active.stepIndex) : undefined;
      if (step?.type === 'choose' && active.choiceId) {
        get().recordChoice(active.initiationId, active.stepIndex, active.choiceId);
      }
    }

    const def = getInitiationForWorld(worldId);
    set((s) => ({
      activeInitiation: null,
      initiationStatus: { ...s.initiationStatus, [worldId]: 'completed' },
    }));
    if (def) {
      get().addJournalEntry(def.completionJournal.title, def.completionJournal.body);
    }
    worldEvents.emit({ type: 'initiation/completed', worldId });
    get().reevaluateProgress();
    get().persist();
  },

  setInitiationAvailable: (worldId) => {
    set((s) => {
      if (s.initiationStatus[worldId] !== 'locked') return s;
      return {
        initiationStatus: { ...s.initiationStatus, [worldId]: 'available' },
      };
    });
    get().persist();
  },

  getInitiationStatus: (worldId) => {
    return get().initiationStatus[worldId] ?? 'locked';
  },

  isAgeInitiated: (worldId) => {
    const id = worldId ?? get().currentWorldId;
    return get().initiationStatus[id] === 'completed';
  },

  cancelInitiation: () => {
    const active = get().activeInitiation;
    if (!active) return;
    const def = getInitiationById(active.initiationId);
    set({
      activeInitiation: null,
      initiationStatus: def
        ? { ...get().initiationStatus, [def.worldId]: 'available' }
        : get().initiationStatus,
    });
    get().persist();
  },

  recordChoice: (initiationId, stepIndex, choiceId) => {
    set((s) => {
      const exists = s.choiceHistory.some(
        (c) =>
          c.initiationId === initiationId &&
          c.stepIndex === stepIndex &&
          c.choiceId === choiceId,
      );
      if (exists) return s;
      return {
        choiceHistory: [
          ...s.choiceHistory,
          { initiationId, stepIndex, choiceId, at: Date.now() },
        ],
      };
    });
    get().reevaluateProgress();
    get().persist();
  },

  reevaluateProgress: () => {
    const state = get();
    const input = buildProgressInputFromWorld(state);
    const result = evaluateProgress(input);
    if (result.newlyCompletedNodeIds.length === 0) return;

    const applied = applyProgressEffects(
      {
        pathFlags: state.pathFlags,
        activePathId: state.activePathId,
        revealedMarkerIds: state.revealedMarkerIds,
        unlockedWorldIds: state.unlockedWorldIds,
        entities: state.entities,
        journal: state.journal,
      },
      result.newlyCompletedNodeIds,
    );

    set({
      completedProgressNodeIds: result.allCompletedNodeIds,
      pathFlags: applied.pathFlags,
      activePathId: applied.activePathId,
      revealedMarkerIds: applied.revealedMarkerIds,
      unlockedWorldIds: applied.unlockedWorldIds,
      entities: applied.entities,
      journal: applied.journal,
    });
    get().persist();
  },

  isMarkerVisible: (markerId) => {
    const entity = get().entities.find((e) => e.id === markerId && e.kind === 'marker');
    if (!entity) return false;
    if (entity.state.progressHidden !== true) return true;
    return entity.state.progressRevealed === true || get().revealedMarkerIds.includes(markerId);
  },
}));

function isAgeUnlockedInternal(
  state: Pick<
    WorldState,
    'unlockedWorldIds' | 'completedPuzzleIds' | 'visitedWorldIds'
  >,
  ageId: string,
): boolean {
  if (state.unlockedWorldIds.includes(ageId)) return true;
  const age = worldRegistry.getAge(ageId);
  if (!age) return false;
  if (ageId === 'grove') return true;

  if (age.unlock?.requiresAgeIds?.length) {
    const agesMet = age.unlock.requiresAgeIds.every(
      (id) => state.unlockedWorldIds.includes(id) || state.visitedWorldIds.includes(id),
    );
    if (!agesMet) return false;
  }

  if (age.unlock?.requiresPuzzleIds?.length) {
    return age.unlock.requiresPuzzleIds.every((pid) => state.completedPuzzleIds.includes(pid));
  }

  return false;
}

export function isAgeUnlocked(ageId: string): boolean {
  return isAgeUnlockedInternal(useWorldStore.getState(), ageId);
}
