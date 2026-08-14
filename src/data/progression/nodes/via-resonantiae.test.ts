import { describe, expect, it } from 'vitest';
import { evaluateProgress } from '../../../core/progression/evaluateProgress';
import { applyProgressEffects } from '../../../core/progression/applyEffects';
import {
  createProgressInput,
  withAgeVisited,
  withGroveInitiationComplete,
} from '../../../core/progression/testFixtures';
import { spawnEntitiesForAge, worldRegistry } from '../../../core/world/WorldRegistry';
import { GROVE_AGE } from '../../ages/grove';

describe('Via Resonantiae progression', () => {
  it('unlocks threshold after cross-age practice depth', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withAgeVisited(input, 'alexandria');
    input = withAgeVisited(input, 'rome');
    input = {
      ...input,
      spiritualDepth: 0.32,
      resonance: { hermetic: 0.32 },
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('via-resonantiae-threshold');
  });

  it('does not unlock threshold without Rome visit', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withAgeVisited(input, 'alexandria');
    input = {
      ...input,
      spiritualDepth: 0.35,
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).not.toContain('via-resonantiae-threshold');
  });

  it('reveals charter marker and sets path on threshold', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities,
        journal: [],
      },
      ['via-resonantiae-threshold'],
    );
    expect(applied.revealedMarkerIds).toContain('grove-via-charter');
    expect(applied.pathFlags['via-resonantiae-discovered']).toBe(true);
    expect(applied.activePathId).toBe('via-resonantiae');
    const marker = applied.entities.find((e) => e.id === 'grove-via-charter');
    expect(marker?.state.progressRevealed).toBe(true);
  });

  it('reveals silent gate marker on final node', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities,
        journal: [],
      },
      ['via-resonantiae-silent-gate'],
    );
    expect(applied.revealedMarkerIds).toContain('grove-via-silent-gate');
    expect(applied.pathFlags['via-resonantiae-silent-gate']).toBe(true);
    expect(applied.journal[applied.journal.length - 1]?.title).toBe('Liber V — Silence');
  });

  it('cascades through all Libers to Book of Dimensions at full depth', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    for (const age of ['alexandria', 'rome', 'desert', 'byzantium', 'cordoba']) {
      input = withAgeVisited(input, age);
    }
    input = {
      ...input,
      spiritualDepth: 0.65,
      resonance: { via_resonantiae: 0.45 },
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('via-resonantiae-silent-gate');
    expect(result.allCompletedNodeIds).toContain('via-resonantiae-liber-vi');
  });

  it('does not unlock Book of Dimensions below full depth', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    for (const age of ['alexandria', 'rome', 'desert', 'byzantium', 'cordoba']) {
      input = withAgeVisited(input, age);
    }
    input = {
      ...input,
      spiritualDepth: 0.56,
      resonance: { via_resonantiae: 0.45 },
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('via-resonantiae-silent-gate');
    expect(result.allCompletedNodeIds).not.toContain('via-resonantiae-liber-vi');
  });

  it('reveals dimensions marker, sets ladder flag, and journals the Overflow', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities,
        journal: [],
      },
      ['via-resonantiae-liber-vi'],
    );
    expect(applied.revealedMarkerIds).toContain('grove-via-liber-vi');
    expect(applied.pathFlags['via-resonantiae-ladder']).toBe(true);
    expect(applied.journal[applied.journal.length - 1]?.title).toBe('Liber VI — The Overflow');
    const marker = applied.entities.find((e) => e.id === 'grove-via-liber-vi');
    expect(marker?.state.progressRevealed).toBe(true);
  });

  it('completes the Overflow capstone once witnessed after Liber VI', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    for (const age of ['alexandria', 'rome', 'desert', 'byzantium', 'cordoba']) {
      input = withAgeVisited(input, age);
    }
    input = {
      ...input,
      spiritualDepth: 0.65,
      resonance: { via_resonantiae: 0.45 },
      pathFlags: { 'overflow-witnessed': true },
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('via-resonantiae-overflow');
  });

  it('does not complete the capstone without witnessing the Overflow', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    for (const age of ['alexandria', 'rome', 'desert', 'byzantium', 'cordoba']) {
      input = withAgeVisited(input, age);
    }
    input = {
      ...input,
      spiritualDepth: 0.65,
      resonance: { via_resonantiae: 0.45 },
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('via-resonantiae-liber-vi');
    expect(result.allCompletedNodeIds).not.toContain('via-resonantiae-overflow');
  });

  it('seals the path and journals Amen Resonantiae on the capstone', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities,
        journal: [],
      },
      ['via-resonantiae-overflow'],
    );
    expect(applied.pathFlags['via-resonantiae-complete']).toBe(true);
    expect(applied.journal[applied.journal.length - 1]?.title).toBe('Amen Resonantiae');
  });

  it('validates all via-resonantiae markers against events', () => {
    const errors = worldRegistry.validate();
    expect(errors).toEqual([]);
  });
});
