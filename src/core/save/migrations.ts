import type { PersistedWorldSnapshot } from './saveSchema';
import { SAVE_VERSION } from './saveSchema';
import { spawnAllWorldEntities } from '../world/WorldRegistry';

export function createDefaultSnapshot(): PersistedWorldSnapshot {
  return {
    saveVersion: SAVE_VERSION,
    savedAt: Date.now(),
    currentWorldId: 'grove',
    unlockedWorldIds: ['grove'],
    visitedWorldIds: ['grove'],
    worldLayers: { grove: 'material' },
    discoveredEventIds: [],
    resonance: {},
    sessionsCompleted: 0,
    entities: spawnAllWorldEntities(),
    completedPuzzleIds: [],
    puzzleState: {},
    simInstances: [
      {
        id: 'player-material',
        kind: 'player-material',
        worldId: 'grove',
        layer: 'material',
        controller: 'human',
      },
    ],
    entanglements: [],
    journal: [],
    eraWitnessFlags: [],
    lastSimTickMs: Date.now(),
  };
}

export function migrateSave(raw: unknown): PersistedWorldSnapshot {
  if (!raw || typeof raw !== 'object') {
    return createDefaultSnapshot();
  }
  const data = raw as Partial<PersistedWorldSnapshot>;
  if (!data.saveVersion || data.saveVersion < SAVE_VERSION) {
    return { ...createDefaultSnapshot(), ...data, saveVersion: SAVE_VERSION };
  }
  return data as PersistedWorldSnapshot;
}

export const applySnapshot = migrateSave;
