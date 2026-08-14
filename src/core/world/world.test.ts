import { describe, expect, it } from 'vitest';
import {
  worldRegistry,
  spawnEntitiesForAge,
  spawnAllWorldEntities,
  repairWorldEntities,
} from './WorldRegistry';
import { GROVE_AGE } from '../../data/ages/grove';
import { ALEXANDRIA_AGE } from '../../data/ages/alexandria';
import { createDefaultSnapshot, migrateSave } from '../save/migrations';
import { loadSave } from '../save/saveGame';
import { worldEvents } from './WorldEvents';
import { simDirector } from './SimDirector';
import { checkRingAlignment } from '../puzzles/index';

describe('WorldRegistry', () => {
  it('validates grove age without errors', () => {
    expect(worldRegistry.validate()).toEqual([]);
  });

  it('spawns marker and actor entities for grove', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    expect(entities.filter((e) => e.kind === 'marker').length).toBe(17);
    expect(entities.filter((e) => e.kind === 'actor').length).toBe(1);
    expect(entities.some((e) => e.kind === 'portal')).toBe(true);
    expect(entities.some((e) => e.id === 'grove-via-silent-gate')).toBe(true);
    expect(entities.some((e) => e.id === 'grove-via-liber-vi')).toBe(true);
    expect(entities.some((e) => e.id === 'grove-pythagorean')).toBe(true);
    expect(entities.some((e) => e.id === 'puzzle-grove-puzzle-hermetic-rings')).toBe(true);
  });

  it('keeps hermetic ring puzzle on grove after repair across multi-age markers', () => {
    const fresh = spawnAllWorldEntities();
    const hermeticPuzzles = fresh.filter(
      (e) => e.kind === 'puzzle-mechanism' && e.defId === 'puzzle-hermetic-rings',
    );
    expect(hermeticPuzzles).toHaveLength(1);
    expect(hermeticPuzzles[0]?.worldId).toBe('grove');

    // Simulate legacy save where duplicate global puzzle ids collapsed to the last age.
    const legacyCollapsed = fresh
      .filter((e) => !(e.kind === 'puzzle-mechanism' && e.defId === 'puzzle-hermetic-rings'))
      .concat({
        id: 'puzzle-puzzle-hermetic-rings',
        kind: 'puzzle-mechanism' as const,
        defId: 'puzzle-hermetic-rings',
        worldId: 'cordoba',
        layer: 'material' as const,
        transform: { x: 0, z: 0 },
        state: { completed: false, ringRotations: [1, 0, 0] },
      });

    const repaired = repairWorldEntities(legacyCollapsed);
    const grovePuzzle = repaired.find(
      (e) => e.id === 'puzzle-grove-puzzle-hermetic-rings' && e.worldId === 'grove',
    );
    expect(grovePuzzle).toBeTruthy();
    expect(grovePuzzle?.transform.x).toBe(5);
    expect(grovePuzzle?.transform.z).toBe(-5);
  });

  it('validates Alexandria expanded library polish data', () => {
    expect(ALEXANDRIA_AGE.terrain.siteHalfSize).toBe(32);
    expect(ALEXANDRIA_AGE.terrain.size).toBeGreaterThanOrEqual(
      ALEXANDRIA_AGE.terrain.siteHalfSize * 2,
    );
    expect(
      ALEXANDRIA_AGE.scenery?.buildings.filter((b) => b.preset === 'library-block'),
    ).toHaveLength(3);
    expect(ALEXANDRIA_AGE.postInitiationDialogues).toContainEqual(
      expect.objectContaining({
        id: 'alexandria-library-colonnade-after-purification',
        requiresPathFlag: { flag: 'alexandria-purified-library-dialogue', value: true },
      }),
    );
    expect(worldRegistry.validate()).toEqual([]);
  });

  it('keeps puzzle-less return portals unlocked, including after repair', () => {
    const alex = spawnEntitiesForAge(ALEXANDRIA_AGE);
    const returnPortal = alex.find((e) => e.id === 'portal-alex-grove');
    expect(returnPortal?.state.unlocked).toBe(true);
    expect(returnPortal?.state.puzzleId).toBeNull();

    const cordobaGate = alex.find((e) => e.id === 'portal-alex-cordoba');
    expect(cordobaGate?.state.unlocked).toBe(false);

    const repaired = repairWorldEntities([
      {
        ...returnPortal!,
        state: { ...returnPortal!.state, unlocked: false },
      },
    ]);
    expect(repaired.find((e) => e.id === 'portal-alex-grove')?.state.unlocked).toBe(true);
  });

  it('repairWorldEntities adds missing actors without dropping saved marker state', () => {
    const fresh = spawnEntitiesForAge(GROVE_AGE);
    const marker = fresh.find((e) => e.id === 'grove-plato')!;
    const repaired = repairWorldEntities([
      { ...marker, state: { ...marker.state, discovered: true } },
    ]);
    expect(repaired.some((e) => e.id === 'academy-guide')).toBe(true);
    expect(repaired.find((e) => e.id === 'grove-plato')?.state.discovered).toBe(true);
  });
});

describe('save migrations', () => {
  it('round-trips default snapshot', () => {
    const snap = createDefaultSnapshot();
    const migrated = migrateSave(snap);
    expect(migrated.saveVersion).toBe(3);
    expect(migrated.currentWorldId).toBe('grove');
  });

  it('migrates invalid save to default', () => {
    const migrated = migrateSave(null);
    expect(migrated.entities.length).toBeGreaterThan(0);
  });

  it('returns onboarding players to grove when initiation is incomplete', () => {
    const migrated = migrateSave({
      saveVersion: 3,
      currentWorldId: 'rome',
      initiationStatus: {
        grove: 'available',
        alexandria: 'locked',
        rome: 'available',
        desert: 'locked',
      },
    });
    expect(migrated.currentWorldId).toBe('grove');
    expect(migrated.activeInitiation).toBeNull();
  });

  it('keeps current world after grove initiation is completed', () => {
    const migrated = migrateSave({
      saveVersion: 3,
      currentWorldId: 'rome',
      initiationStatus: {
        grove: 'completed',
        alexandria: 'locked',
        rome: 'available',
        desert: 'locked',
      },
    });
    expect(migrated.currentWorldId).toBe('rome');
  });

  it('restores missing guide NPC from empty entity list', () => {
    const migrated = migrateSave({
      saveVersion: 3,
      currentWorldId: 'grove',
      entities: [],
      initiationStatus: {
        grove: 'available',
        alexandria: 'locked',
        rome: 'locked',
        desert: 'locked',
      },
    });
    expect(migrated.entities.some((e) => e.id === 'academy-guide')).toBe(true);
  });
});

describe('WorldEvents', () => {
  it('notifies subscribers', () => {
    const events: string[] = [];
    const unsub = worldEvents.subscribe((e) => {
      if (e.type === 'entity/discovered') events.push(e.eventId);
    });
    worldEvents.emit({ type: 'entity/discovered', entityId: 'x', eventId: 'hermetic-corpus' });
    unsub();
    expect(events).toEqual(['hermetic-corpus']);
  });
});

describe('SimDirector', () => {
  it('ticks without registered instances', () => {
    simDirector.resetClock();
    simDirector.tick(1000);
    simDirector.tick(2000);
    expect(simDirector.getAllInstances()).toEqual([]);
  });
});

describe('puzzles', () => {
  it('checks ring alignment', () => {
    expect(checkRingAlignment('puzzle-hermetic-rings', [2, 2, 1])).toBe(true);
    expect(checkRingAlignment('puzzle-hermetic-rings', [0, 0, 0])).toBe(false);
  });
});

describe('exportSnapshot shape', () => {
  it('default snapshot has required fields', () => {
    const snap = createDefaultSnapshot();
    expect(snap.discoveredEventIds).toEqual([]);
    expect(snap.entities.length).toBeGreaterThan(0);
    expect(snap.simInstances[0]?.id).toBe('player-material');
    expect(snap.choiceHistory).toEqual([]);
    expect(snap.completedProgressNodeIds).toEqual([]);
  });
});

describe('loadSave', () => {
  it('returns null when empty', () => {
    expect(loadSave()).toBeNull();
  });
});
