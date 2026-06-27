import { describe, expect, it } from 'vitest';
import type { InitiationStep } from './types';
import {
  defaultInitiationStatus,
  distanceXZ,
  isChooseCorrect,
  isStepComplete,
  migrateInitiationStatus,
  yawMatches,
} from './runInitiation';
import { INITIATION_GROVE } from '../../data/initiations/index';
import { migrateSave } from '../save/migrations';
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
        keysPressedSinceStep: false,
      }),
    ).toBe(true);
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

describe('migrateInitiationStatus', () => {
  it('merges with defaults', () => {
    const status = migrateInitiationStatus({ grove: 'completed' });
    expect(status.grove).toBe('completed');
    expect(status.desert).toBe('locked');
  });
});
