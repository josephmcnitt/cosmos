import { describe, expect, it } from 'vitest';
import { worldRegistry, spawnEntitiesForAge } from './WorldRegistry';
import { GROVE_AGE } from '../../data/ages/grove';
import { createDefaultSnapshot, migrateSave } from '../save/migrations';
import { loadSave } from '../save/saveGame';
import { worldEvents } from './WorldEvents';
import { simDirector } from './SimDirector';
import { checkRingAlignment } from '../puzzles/index';

describe('WorldRegistry', () => {
  it('validates grove age without errors', () => {
    expect(worldRegistry.validate()).toEqual([]);
  });

  it('spawns marker entities for grove', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    expect(entities.filter((e) => e.kind === 'marker').length).toBe(5);
    expect(entities.some((e) => e.kind === 'portal')).toBe(true);
  });
});

describe('save migrations', () => {
  it('round-trips default snapshot', () => {
    const snap = createDefaultSnapshot();
    const migrated = migrateSave(snap);
    expect(migrated.saveVersion).toBe(1);
    expect(migrated.currentWorldId).toBe('grove');
  });

  it('migrates invalid save to default', () => {
    const migrated = migrateSave(null);
    expect(migrated.entities.length).toBeGreaterThan(0);
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
    expect(checkRingAlignment('puzzle-hermetic-rings', [0, 2, 1])).toBe(true);
    expect(checkRingAlignment('puzzle-hermetic-rings', [0, 0, 0])).toBe(false);
  });
});

describe('exportSnapshot shape', () => {
  it('default snapshot has required fields', () => {
    const snap = createDefaultSnapshot();
    expect(snap.discoveredEventIds).toEqual([]);
    expect(snap.entities.length).toBeGreaterThan(0);
    expect(snap.simInstances[0]?.id).toBe('player-material');
  });
});

describe('loadSave', () => {
  it('returns null when empty', () => {
    expect(loadSave()).toBeNull();
  });
});
