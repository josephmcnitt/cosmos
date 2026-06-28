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

  it('skips ring puzzle hint when convergence was completed on a legacy save', () => {
    const step = getPathNextStep(
      createProgressInput({
        completedProgressNodeIds: [
          'grove-hermetic-intro',
          'grove-choice-experiential',
          'grove-hermetic-convergence',
        ],
        pathFlags: {
          'grove-hermetic-path': 'experiential',
          'grove-experiential-practice': true,
        },
      }),
    );
    expect(step?.nodeId).not.toBe('grove-hermetic-rings');
    expect(step?.nodeId).toBe('alexandria-purification-intro');
  });
});
