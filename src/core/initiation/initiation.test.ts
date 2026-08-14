import { describe, expect, it, vi } from 'vitest';
import type { InitiationStep } from './types';
import {
  defaultInitiationStatus,
  distanceXZ,
  isChooseCorrect,
  isChooseResolved,
  isStepComplete,
  migrateInitiationStatus,
  yawMatches,
} from './runInitiation';
import { INITIATION_ALEXANDRIA, INITIATION_GROVE } from '../../data/initiations/index';
import { migrateSave, createDefaultSnapshot } from '../save/migrations';
import { SAVE_VERSION } from '../save/saveSchema';
import { spawnEntitiesForAge } from '../world/WorldRegistry';
import { GROVE_AGE } from '../../data/ages/grove';
import { isAgeInitiated } from '../world/worldQueries';
import { useWorldStore } from '../world/WorldState';

describe('initiation runInitiation', () => {
  it('default status has grove available', () => {
    expect(defaultInitiationStatus().grove).toBe('available');
    expect(defaultInitiationStatus().alexandria).toBe('locked');
  });

  it('migrates v1 saves with grove available', () => {
    const migrated = migrateSave({ saveVersion: 1, currentWorldId: 'grove' });
    expect(migrated.saveVersion).toBe(SAVE_VERSION);
    expect(migrated.initiationStatus.grove).toBe('available');
    expect(migrated.choiceHistory).toEqual([]);
  });

  it('hermetic branch choices resolve without correct flag', () => {
    const step = INITIATION_GROVE.steps.find((s) => s.type === 'choose' && s.options.some((o) => o.id === 'hermetic-rational'));
    if (!step || step.type !== 'choose') return;
    expect(isChooseResolved(step, 'hermetic-rational')).toBe(true);
    expect(isChooseResolved(step, 'hermetic-experiential')).toBe(true);
    expect(isChooseCorrect(step, 'hermetic-rational')).toBe(true);
  });

  it('alexandria purification branch choices resolve without correct flag', () => {
    const step = INITIATION_ALEXANDRIA.steps.find(
      (s) => s.type === 'choose' && s.options.some((o) => o.id === 'alexandria-correspondence'),
    );
    if (!step || step.type !== 'choose') return;
    expect(isChooseResolved(step, 'alexandria-correspondence')).toBe(true);
    expect(isChooseResolved(step, 'alexandria-silence')).toBe(true);
    expect(isChooseCorrect(step, 'alexandria-silence')).toBe(true);
  });

  it('records choice to choiceHistory', () => {
    useWorldStore.setState({
      choiceHistory: [],
      completedProgressNodeIds: [],
      pathFlags: {},
      revealedMarkerIds: [],
      entities: spawnEntitiesForAge(GROVE_AGE),
      journal: [],
      unlockedWorldIds: ['grove'],
    });
    useWorldStore.getState().recordChoice('initiation-grove', 6, 'hermetic-rational');
    expect(useWorldStore.getState().choiceHistory).toHaveLength(1);
    expect(useWorldStore.getState().choiceHistory[0]?.choiceId).toBe('hermetic-rational');
  });

  it('checks walk-to step', () => {
    const step = INITIATION_GROVE.steps.find((s: InitiationStep) => s.type === 'walk-to')!;
    expect(step.type).toBe('walk-to');
    if (step.type !== 'walk-to') return;
    expect(
      isStepComplete(step, {
        playerX: -8,
        playerZ: 2,
        playerYaw: 0,
        avatarMoving: false,
        stepStartedAt: performance.now(),
        lastKeyPressedAtMs: 0,
      }),
    ).toBe(true);
  });

  it('silence step completes after quiet time and recovers from keypresses', () => {
    const step = { type: 'silence', text: '', durationSec: 6 } as InitiationStep;
    const base = {
      playerX: 0,
      playerZ: 0,
      playerYaw: 0,
      avatarMoving: false,
      choiceId: undefined,
    };
    const now = 100_000;
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(now);
    try {
      // Quiet since step start → complete.
      expect(
        isStepComplete(step, { ...base, stepStartedAt: now - 7000, lastKeyPressedAtMs: 0 }),
      ).toBe(true);

      // A recent keypress restarts the timer — not complete yet…
      expect(
        isStepComplete(step, {
          ...base,
          stepStartedAt: now - 60_000,
          lastKeyPressedAtMs: now - 2000,
        }),
      ).toBe(false);

      // …but an old keypress must NOT block forever (the walk-in-holding-W soft-lock).
      expect(
        isStepComplete(step, {
          ...base,
          stepStartedAt: now - 60_000,
          lastKeyPressedAtMs: now - 7000,
        }),
      ).toBe(true);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('hold-still step uses the same recoverable quiet timer', () => {
    const step = { type: 'hold-still', text: '', durationSec: 8 } as InitiationStep;
    const base = { playerX: 0, playerZ: 0, playerYaw: 0, choiceId: undefined };
    const now = 100_000;
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(now);
    try {
      expect(
        isStepComplete(step, {
          ...base,
          avatarMoving: false,
          stepStartedAt: now - 9000,
          lastKeyPressedAtMs: now - 7000,
        }),
      ).toBe(false);
      expect(
        isStepComplete(step, {
          ...base,
          avatarMoving: false,
          stepStartedAt: now - 20_000,
          lastKeyPressedAtMs: now - 9000,
        }),
      ).toBe(true);
      expect(
        isStepComplete(step, {
          ...base,
          avatarMoving: true,
          stepStartedAt: now - 20_000,
          lastKeyPressedAtMs: 0,
        }),
      ).toBe(false);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('validates choose step', () => {
    const step = INITIATION_GROVE.steps.find((s: InitiationStep) => s.type === 'choose')!;
    if (step.type !== 'choose') return;
    expect(isChooseCorrect(step, 'no')).toBe(true);
    expect(isChooseCorrect(step, 'yes')).toBe(false);
  });

  it('yawMatches east', () => {
    expect(yawMatches(Math.PI / 2, Math.PI / 2, 0.6)).toBe(true);
  });

  it('distanceXZ', () => {
    expect(distanceXZ(0, 0, 3, 4)).toBe(5);
  });
});

describe('isAgeInitiated gating', () => {
  it('returns false before completion', () => {
    useWorldStore.setState({
      initiationStatus: { grove: 'available', alexandria: 'locked', rome: 'locked', desert: 'locked' },
      currentWorldId: 'grove',
    });
    expect(isAgeInitiated('grove')).toBe(false);
  });

  it('returns true after completion', () => {
    useWorldStore.setState({
      initiationStatus: { grove: 'completed', alexandria: 'locked', rome: 'locked', desert: 'locked' },
      currentWorldId: 'grove',
    });
    expect(isAgeInitiated('grove')).toBe(true);
  });
});

describe('WorldRegistry actors', () => {
  it('spawns actor for grove', () => {
    const entities = spawnEntitiesForAge(GROVE_AGE);
    expect(entities.some((e) => e.kind === 'actor')).toBe(true);
  });
});

describe('WorldStore reevaluateProgress', () => {
  it('unlocks rational branch from save-shaped input', () => {
    const snap = createDefaultSnapshot();
    useWorldStore.getState().applySnapshotData({
      ...snap,
      initiationStatus: { grove: 'completed', alexandria: 'locked', rome: 'locked', desert: 'locked' },
      choiceHistory: [
        {
          initiationId: 'initiation-grove',
          stepIndex: 6,
          choiceId: 'hermetic-rational',
          at: Date.now(),
        },
      ],
      completedProgressNodeIds: ['grove-hermetic-intro'],
    });
    useWorldStore.getState().reevaluateProgress();
    const state = useWorldStore.getState();
    expect(state.completedProgressNodeIds).toContain('grove-choice-rational');
    expect(state.revealedMarkerIds).toContain('grove-rosicrucian');
  });
});

describe('migrateInitiationStatus', () => {
  it('merges with defaults', () => {
    const status = migrateInitiationStatus({ grove: 'completed' });
    expect(status.grove).toBe('completed');
    expect(status.desert).toBe('locked');
  });
});
