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

  it('unlocks Alexandria post-init dialogue flag after purification', () => {
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
    expect(result.allCompletedNodeIds).toContain('alexandria-library-purification-dialogue');
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
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove', 'alexandria'],
        entities,
        journal: [],
      },
      ['alexandria-library-purification-dialogue'],
    );
    expect(applied.pathFlags['alexandria-purified-library-dialogue']).toBe(true);
    expect(applied.journal.at(-1)?.title).toBe('Serapeum colonnade');
  });
});

describe('WorldRegistry progression validation', () => {
  it('validates grove hermetic nodes without errors', () => {
    const errors = worldRegistry.validate();
    expect(errors).toEqual([]);
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
