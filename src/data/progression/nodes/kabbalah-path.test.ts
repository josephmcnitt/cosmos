import { describe, expect, it } from 'vitest';
import { evaluateProgress } from '../../../core/progression/evaluateProgress';
import { applyProgressEffects } from '../../../core/progression/applyEffects';
import {
  createProgressInput,
  withAgeVisited,
  withGroveInitiationComplete,
  withPuzzleCompleted,
} from '../../../core/progression/testFixtures';
import { spawnEntitiesForAge } from '../../../core/world/WorldRegistry';
import { GROVE_AGE } from '../../ages/grove';

describe('Kabbalah path progression', () => {
  it('opens PaRDeS after kabbalah practice at the Zohar stone', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = { ...input, resonance: { kabbalah: 0.2 }, spiritualDepth: 0.2 };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('kabbalah-pardes');
  });

  it('does not open PaRDeS without kabbalah resonance', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = { ...input, resonance: { hermetic: 0.4 }, spiritualDepth: 0.4 };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).not.toContain('kabbalah-pardes');
  });

  it('reveals the hidden PaRDeS stone in the Grove', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities,
        journal: [],
      },
      ['kabbalah-pardes'],
    );
    expect(applied.revealedMarkerIds).toContain('grove-pardes');
    const marker = applied.entities.find((e) => e.id === 'grove-pardes');
    expect(marker?.state.progressRevealed).toBe(true);
  });

  it('passes the gematria gate and sets the kabbalah path', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withPuzzleCompleted(input, 'puzzle-zohar-gematria');
    input = { ...input, resonance: { kabbalah: 0.2 }, spiritualDepth: 0.2 };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('kabbalah-gematria-gate');

    const applied = applyProgressEffects(
      {
        pathFlags: {},
        revealedMarkerIds: [],
        unlockedWorldIds: ['grove'],
        entities: spawnEntitiesForAge(GROVE_AGE),
        journal: [],
      },
      ['kabbalah-gematria-gate'],
    );
    expect(applied.activePathId).toBe('kabbalah');
    expect(applied.pathFlags['kabbalah-letters']).toBe(true);
  });

  it('completes tikkun after Safed initiation and deeper practice', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withPuzzleCompleted(input, 'puzzle-zohar-gematria');
    input = withAgeVisited(input, 'safed');
    input = {
      ...input,
      initiationStatus: { ...input.initiationStatus, safed: 'completed' },
      resonance: { kabbalah: 0.35 },
      spiritualDepth: 0.35,
    };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('kabbalah-tikkun');
  });

  it('completes the Agrippa synthesis via the Saturn square and Cologne', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withPuzzleCompleted(input, 'puzzle-zohar-gematria');
    input = withPuzzleCompleted(input, 'puzzle-saturn-square');
    input = withAgeVisited(input, 'cologne');
    input = { ...input, resonance: { kabbalah: 0.2 }, spiritualDepth: 0.2 };
    const result = evaluateProgress(input);
    expect(result.allCompletedNodeIds).toContain('agrippa-three-worlds');
  });

  it('mirrors the Overflow only after both arcs meet', () => {
    let input = withGroveInitiationComplete(createProgressInput());
    input = withPuzzleCompleted(input, 'puzzle-zohar-gematria');
    input = withAgeVisited(input, 'safed');
    input = {
      ...input,
      initiationStatus: { ...input.initiationStatus, safed: 'completed' },
      resonance: { kabbalah: 0.35 },
      spiritualDepth: 0.35,
    };
    const withoutWitness = evaluateProgress(input);
    expect(withoutWitness.allCompletedNodeIds).not.toContain('kabbalah-overflow-mirror');

    input = { ...input, pathFlags: { 'overflow-witnessed': true } };
    const withWitness = evaluateProgress(input);
    expect(withWitness.allCompletedNodeIds).toContain('kabbalah-overflow-mirror');
  });
});
