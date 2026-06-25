import { migrateSave } from './migrations';
import { SAVE_KEY, type PersistedWorldSnapshot } from './saveSchema';

export function loadSave(): PersistedWorldSnapshot | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrateSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveGame(snapshot: PersistedWorldSnapshot): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...snapshot, savedAt: Date.now(), saveVersion: snapshot.saveVersion }),
    );
  } catch {
    // quota or private mode
  }
}

export function clearSave(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(SAVE_KEY);
}

export function exportSnapshot(state: ReturnType<typeof import('../world/WorldState').useWorldStore.getState>): PersistedWorldSnapshot {
  return {
    saveVersion: 1,
    savedAt: Date.now(),
    currentWorldId: state.currentWorldId,
    unlockedWorldIds: state.unlockedWorldIds,
    visitedWorldIds: state.visitedWorldIds,
    worldLayers: state.worldLayers,
    discoveredEventIds: state.discoveredEventIds,
    resonance: state.resonance,
    sessionsCompleted: state.sessionsCompleted,
    entities: state.entities,
    completedPuzzleIds: state.completedPuzzleIds,
    puzzleState: state.puzzleState,
    simInstances: state.simInstances,
    entanglements: state.entanglements,
    journal: state.journal,
    eraWitnessFlags: state.eraWitnessFlags,
    lastSimTickMs: state.lastSimTickMs,
  };
}

export { createDefaultSnapshot, migrateSave } from './migrations';