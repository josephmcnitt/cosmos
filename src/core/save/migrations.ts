import type { PersistedWorldSnapshot } from './saveSchema';
import { SAVE_VERSION } from './saveSchema';
import { spawnAllWorldEntities, repairWorldEntities } from '../world/WorldRegistry';
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

function resolveOnboardingWorldId(data: Partial<PersistedWorldSnapshot>): string {
  const initiationStatus = migrateInitiationStatus(data.initiationStatus);
  if (initiationStatus.grove === 'completed') {
    return data.currentWorldId ?? 'grove';
  }
  return 'grove';
}

function repairLegacyProgression(snapshot: PersistedWorldSnapshot): PersistedWorldSnapshot {
  const completed = new Set(snapshot.completedProgressNodeIds);
  const puzzles = new Set(snapshot.completedPuzzleIds);
  const convergenceWithoutRings =
    completed.has('grove-hermetic-convergence') && !completed.has('grove-hermetic-rings');
  const puzzleDoneButNodeMissing =
    puzzles.has('puzzle-hermetic-rings') && !completed.has('grove-hermetic-rings');

  if (!convergenceWithoutRings && !puzzleDoneButNodeMissing) return snapshot;

  completed.add('grove-hermetic-rings');
  puzzles.add('puzzle-hermetic-rings');

  return {
    ...snapshot,
    completedProgressNodeIds: [...completed],
    completedPuzzleIds: [...puzzles],
    entities: snapshot.entities.map((entity) => {
      if (entity.kind === 'puzzle-mechanism' && entity.defId === 'puzzle-hermetic-rings') {
        return { ...entity, state: { ...entity.state, completed: true } };
      }
      return entity;
    }),
  };
}

export function migrateSave(raw: unknown): PersistedWorldSnapshot {
  if (!raw || typeof raw !== 'object') {
    return createDefaultSnapshot();
  }
  const data = raw as Partial<PersistedWorldSnapshot>;
  const defaults = createDefaultSnapshot();
  const currentWorldId = resolveOnboardingWorldId(data);
  const resetOnboardingWorld = currentWorldId !== data.currentWorldId;
  const entities = repairWorldEntities(data.entities);

  if (!data.saveVersion || data.saveVersion < 2) {
    return repairLegacyProgression({
      ...defaults,
      ...data,
      saveVersion: SAVE_VERSION,
      currentWorldId,
      entities,
      activeInitiation: null,
      initiationStatus: migrateInitiationStatus(
        data.initiationStatus as Record<string, import('../initiation/types').InitiationStatus> | undefined,
      ),
      ...migrateV2ToV3(data),
    } as PersistedWorldSnapshot);
  }

  if (data.saveVersion < 3) {
    return repairLegacyProgression({
      ...defaults,
      ...data,
      saveVersion: SAVE_VERSION,
      currentWorldId,
      entities,
      initiationStatus: migrateInitiationStatus(data.initiationStatus),
      activeInitiation: resetOnboardingWorld ? null : (data.activeInitiation ?? null),
      ...migrateV2ToV3(data),
    } as PersistedWorldSnapshot);
  }

  return repairLegacyProgression({
    ...defaults,
    ...data,
    saveVersion: SAVE_VERSION,
    currentWorldId,
    entities,
    initiationStatus: migrateInitiationStatus(data.initiationStatus),
    activeInitiation: resetOnboardingWorld ? null : (data.activeInitiation ?? null),
    choiceHistory: data.choiceHistory ?? [],
    completedProgressNodeIds: data.completedProgressNodeIds ?? [],
    pathFlags: data.pathFlags ?? {},
    activePathId: data.activePathId,
    revealedMarkerIds: data.revealedMarkerIds ?? [],
  } as PersistedWorldSnapshot);
}

export const applySnapshot = migrateSave;
