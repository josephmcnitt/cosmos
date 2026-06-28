import { describe, expect, it } from 'vitest';
import { getPathNextStep } from './pathNextStep';
import { createProgressInput } from './testFixtures';

describe('getPathNextStep', () => {
  it('returns intro as the first ready step after grove initiation', () => {
    const step = getPathNextStep(
      createProgressInput({
        initiationStatus: { grove: 'completed' },
      }),
    );
    expect(step?.nodeId).toBe('grove-hermetic-intro');
    expect(step?.ready).toBe(true);
  });

  it('surfaces the next age node after the grove branch is finished', () => {
    const step = getPathNextStep(
      createProgressInput({
        completedProgressNodeIds: [
          'grove-hermetic-intro',
          'grove-choice-rational',
          'grove-hermetic-rings',
          'grove-hermetic-convergence',
        ],
        pathFlags: { 'grove-hermetic-path': 'rational' },
        completedPuzzleIds: ['puzzle-hermetic-rings'],
        visitedWorldIds: ['grove', 'alexandria'],
      }),
    );
    expect(step?.nodeId).toBe('alexandria-purification-intro');
    expect(step?.ready).toBe(false);
  });
});
