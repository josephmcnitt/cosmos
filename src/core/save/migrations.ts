import type { PersistedWorldSnapshot } from './saveSchema';
import { SAVE_VERSION } from './saveSchema';
import { spawnAllWorldEntities } from '../world/WorldRegistry';
import { defaultInitiationStatus, migrateInitiationStatus } from '../initiation/runInitiation';

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
    initiationStatus: defaultInitiationStatus(),
    activeInitiation: null,
    choiceHistory: [],
    completedProgressNodeIds: [],
    pathFlags: {},
    activePathId: undefined,
    revealedMarkerIds: [],
  };
}

function migrateV2ToV3(data: Partial<PersistedWorldSnapshot>): Partial<PersistedWorldSnapshot> {
  return {
    choiceHistory: data.choiceHistory ?? [],
    completedProgressNodeIds: data.completedProgressNodeIds ?? [],
    pathFlags: data.pathFlags ?? {},
    activePathId: data.activePathId,
    revealedMarkerIds: data.revealedMarkerIds ?? [],
  };
}

export function migrateSave(raw: unknown): PersistedWorldSnapshot {
  if (!raw || typeof raw !== 'object') {
    return createDefaultSnapshot();
  }
  const data = raw as Partial<PersistedWorldSnapshot>;
  const defaults = createDefaultSnapshot();

  if (!data.saveVersion || data.saveVersion < 2) {
    return {
      ...defaults,
      ...data,
      saveVersion: SAVE_VERSION,
      entities: data.entities?.length ? data.entities : defaults.entities,
      initiationStatus: migrateInitiationStatus(
        data.initiationStatus as Record<string, import('../initiation/types').InitiationStatus> | undefined,
      ),
      activeInitiation: null,
      ...migrateV2ToV3(data),
    };
  }

  if (data.saveVersion < 3) {
    return {
      ...defaults,
      ...data,
      saveVersion: SAVE_VERSION,
      initiationStatus: migrateInitiationStatus(data.initiationStatus),
      activeInitiation: data.activeInitiation ?? null,
      ...migrateV2ToV3(data),
    } as PersistedWorldSnapshot;
  }

  return {
    ...defaults,
    ...data,
    saveVersion: SAVE_VERSION,
    initiationStatus: migrateInitiationStatus(data.initiationStatus),
    activeInitiation: data.activeInitiation ?? null,
    choiceHistory: data.choiceHistory ?? [],
    completedProgressNodeIds: data.completedProgressNodeIds ?? [],
    pathFlags: data.pathFlags ?? {},
    activePathId: data.activePathId,
    revealedMarkerIds: data.revealedMarkerIds ?? [],
  } as PersistedWorldSnapshot;
}

export const applySnapshot = migrateSave;
