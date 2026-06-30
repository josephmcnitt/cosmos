import { describe, expect, it } from 'vitest';
import { evaluateProgress } from './evaluateProgress';
import { applyProgressEffects } from './applyEffects';
import {
  createProgressInput,
  withAlexandriaInitiationComplete,
  withChoice,
  withGroveInitiationComplete,
} from './testFixtures';
import { worldRegistry } from '../world/WorldRegistry';
import { GROVE_AGE } from '../../data/ages/grove';
import { ALEXANDRIA_AGE } from '../../data/ages/alexandria';
import { spawnEntitiesForAge } from '../world/WorldRegistry';
import { createDefaultSnapshot, migrateSave } from '../save/migrations';
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

  it('completes alexandria-purification-intro after alexandria initiation', () => {
    const input = withAlexandriaInitiationComplete(createProgressInput());
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('alexandria-purification-intro');
  });

  it('unlocks alexandria correspondence branch after correspondence choice', () => {
    let input = withAlexandriaInitiationComplete(createProgressInput());
    input = withChoice(input, 'initiation-alexandria', 'alexandria-correspondence', 5);
    input = {
      ...input,
      completedProgressNodeIds: ['alexandria-purification-intro'],
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('alexandria-choice-correspondence');
  });

  it('unlocks alexandria silence branch after silence choice', () => {
    let input = withAlexandriaInitiationComplete(createProgressInput());
    input = withChoice(input, 'initiation-alexandria', 'alexandria-silence', 5);
    input = {
      ...input,
      completedProgressNodeIds: ['alexandria-purification-intro'],
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('alexandria-choice-silence');
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
    expect(applied.revealedMarkerIds).not.toContain('grove-pythagorean');
    expect(applied.pathFlags['grove-hermetic-path']).toBe('rational');
    const marker = applied.entities.find((e) => e.id === 'grove-rosicrucian');
    expect(marker?.state.progressRevealed).toBe(true);
    const pythagorean = applied.entities.find((e) => e.id === 'grove-pythagorean');
    expect(pythagorean?.state.progressRevealed).toBe(false);
  });

  it('reveals pythagorean marker on experiential branch', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const hiddenMarker = entities.find((e) => e.id === 'grove-pythagorean');
    expect(hiddenMarker?.state.progressHidden).toBe(true);
    expect(hiddenMarker?.state.progressRevealed).toBe(false);
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
    expect(applied.pathFlags['grove-hermetic-path']).toBe('experiential');
    expect(applied.revealedMarkerIds).toContain('grove-pythagorean');
    expect(applied.revealedMarkerIds).not.toContain('grove-rosicrucian');
    const marker = applied.entities.find((e) => e.id === 'grove-pythagorean');
    expect(marker?.state.progressRevealed).toBe(true);
  });

  it('reveals alexandria hermetic marker on correspondence branch', () => {
    const entities = spawnEntitiesForAge(ALEXANDRIA_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove', 'alexandria'],
        entities,
        journal: [],
      },
      ['alexandria-choice-correspondence'],
    );
    expect(applied.revealedMarkerIds).toContain('alex-hermetic');
    expect(applied.pathFlags['alexandria-purification-path']).toBe('correspondence');
    expect(applied.activePathId).toBe('alexandria-correspondence');
    const marker = applied.entities.find((e) => e.id === 'alex-hermetic');
    expect(marker?.state.progressRevealed).toBe(true);
    expect(applied.journal[applied.journal.length - 1]?.title).toBe('Purification by correspondence');
  });

  it('reveals alexandria platonic marker on silence branch', () => {
    const entities = spawnEntitiesForAge(ALEXANDRIA_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove', 'alexandria'],
        entities,
        journal: [],
      },
      ['alexandria-choice-silence'],
    );
    expect(applied.revealedMarkerIds).toContain('alex-plato');
    expect(applied.pathFlags['alexandria-purification-path']).toBe('silence');
    expect(applied.activePathId).toBe('alexandria-silence');
    const marker = applied.entities.find((e) => e.id === 'alex-plato');
    expect(marker?.state.progressRevealed).toBe(true);
    expect(applied.journal[applied.journal.length - 1]?.title).toBe('Purification by silence');
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
    expect(applied.journal[applied.journal.length - 1]?.title).toBe('Serapeum colonnade');
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

  it('backfills Hermetic rings when convergence was completed on an older save', () => {
    const migrated = migrateSave({
      saveVersion: 3,
      currentWorldId: 'grove',
      completedProgressNodeIds: [
        'grove-hermetic-intro',
        'grove-choice-experiential',
        'grove-hermetic-convergence',
      ],
      completedPuzzleIds: [],
      entities: createDefaultSnapshot().entities,
    });
    expect(migrated.completedProgressNodeIds).toContain('grove-hermetic-rings');
    expect(migrated.completedPuzzleIds).toContain('puzzle-hermetic-rings');
  });
});
