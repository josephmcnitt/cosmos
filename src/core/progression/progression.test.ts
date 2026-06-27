import { describe, expect, it } from 'vitest';
import { evaluateProgress } from './evaluateProgress';
import { applyProgressEffects } from './applyEffects';
import {
  createProgressInput,
  withChoice,
  withGroveInitiationComplete,
} from './testFixtures';
import { worldRegistry } from '../world/WorldRegistry';
import { GROVE_AGE } from '../../data/ages/grove';
import { ALEXANDRIA_AGE } from '../../data/ages/alexandria';
import { INITIATION_ALEXANDRIA } from '../../data/initiations/index';
import { spawnEntitiesForAge } from '../world/WorldRegistry';
import { migrateSave } from '../save/migrations';
import { SAVE_VERSION } from '../save/saveSchema';

describe('evaluateProgress', () => {
  it('completes grove-hermetic-intro after grove initiation', () => {
    const input = withGroveInitiationComplete(createProgressInput());
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('grove-hermetic-intro');
  });

  it('unlocks rational branch after hermetic-rational choice', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withChoice(input, 'initiation-grove', 'hermetic-rational');
    input = {
      ...input,
      completedProgressNodeIds: ['grove-hermetic-intro'],
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('grove-choice-rational');
  });

  it('unlocks experiential branch after hermetic-experiential choice', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withChoice(input, 'initiation-grove', 'hermetic-experiential');
    input = {
      ...input,
      completedProgressNodeIds: ['grove-hermetic-intro'],
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('grove-choice-experiential');
  });

  it('unlocks Alexandria post-init dialogue flag after Hermetic purification', () => {
    const input = createProgressInput({
      initiationStatus: {
        grove: 'completed',
        alexandria: 'completed',
        rome: 'locked',
        desert: 'locked',
      },
      visitedWorldIds: ['grove', 'alexandria'],
    });
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('alexandria-post-init-dialogue');
  });
});

describe('applyProgressEffects', () => {
  it('reveals rosicrucian marker on rational branch', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities,
        journal: [],
      },
      ['grove-choice-rational'],
    );
    expect(applied.revealedMarkerIds).toContain('grove-rosicrucian');
    expect(applied.pathFlags['grove-hermetic-path']).toBe('rational');
    const marker = applied.entities.find((e) => e.id === 'grove-rosicrucian');
    expect(marker?.state.progressRevealed).toBe(true);
  });

  it('sets experiential practice flag', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities,
        journal: [],
      },
      ['grove-choice-experiential'],
    );
    expect(applied.pathFlags['grove-experiential-practice']).toBe(true);
  });

  it('sets Alexandria post-init dialogue flag and journal stub', () => {
    const flag = INITIATION_ALEXANDRIA.postInitDialogue?.progressFlag;
    expect(flag).toBe('alexandria-post-init-dialogue-ready');

    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove', 'alexandria'],
        entities: spawnEntitiesForAge(ALEXANDRIA_AGE),
        journal: [],
      },
      ['alexandria-post-init-dialogue'],
    );
    expect(applied.pathFlags[flag!]).toBe(true);
    expect(applied.journal.some((entry) => entry.title === 'Keeper afterword')).toBe(true);
  });
});

describe('WorldRegistry progression validation', () => {
  it('validates grove hermetic nodes without errors', () => {
    const errors = worldRegistry.validate();
    expect(errors).toEqual([]);
  });

  it('validates Alexandria expanded library precinct', () => {
    const age = worldRegistry.getAge('alexandria');
    expect(age).toBeDefined();
    expect(age?.terrain.siteHalfSize).toBe(32);
    expect(age?.terrain.size).toBeGreaterThanOrEqual(age!.terrain.siteHalfSize * 2);

    const libraryBlocks = age?.scenery?.buildings.filter((b) => b.preset === 'library-block') ?? [];
    expect(libraryBlocks.map((b) => b.id)).toEqual([
      'alex-library-block',
      'alex-library-east-wing',
      'alex-library-west-wing',
    ]);
    expect(new Set(libraryBlocks.map((b) => b.id)).size).toBe(libraryBlocks.length);
    for (const block of libraryBlocks) {
      expect(Math.abs(block.position[0])).toBeLessThanOrEqual(age!.terrain.siteHalfSize);
      expect(Math.abs(block.position[2])).toBeLessThanOrEqual(age!.terrain.siteHalfSize);
    }
  });
});

describe('save migration v3', () => {
  it('migrates v2 saves with progression defaults', () => {
    const migrated = migrateSave({ saveVersion: 2, currentWorldId: 'grove' });
    expect(migrated.saveVersion).toBe(SAVE_VERSION);
    expect(migrated.choiceHistory).toEqual([]);
    expect(migrated.completedProgressNodeIds).toEqual([]);
    expect(migrated.revealedMarkerIds).toEqual([]);
  });
});
