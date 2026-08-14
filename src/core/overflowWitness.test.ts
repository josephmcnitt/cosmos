import { describe, expect, it } from 'vitest';
import { BIG_BANG_REPLAY_END_SECONDS } from './bigBangReplay';
import {
  isOverflowArmed,
  isOverflowWitnessActive,
  OVERFLOW_ARM_SECONDS,
  OVERFLOW_LADDER_FLAG,
  OVERFLOW_WITNESSED_FLAG,
  shouldMarkOverflowWitnessed,
} from './overflowWitness';

const EARLY = BIG_BANG_REPLAY_END_SECONDS / 2;
const LATE = BIG_BANG_REPLAY_END_SECONDS * 2;
const LADDER = { [OVERFLOW_LADDER_FLAG]: true };

describe('isOverflowArmed', () => {
  it('arms only past the first stars with intro complete', () => {
    expect(isOverflowArmed(OVERFLOW_ARM_SECONDS * 2, true)).toBe(true);
    expect(isOverflowArmed(EARLY, true)).toBe(false);
    expect(isOverflowArmed(OVERFLOW_ARM_SECONDS * 2, false)).toBe(false);
  });
});

describe('isOverflowWitnessActive', () => {
  it('is active when armed, in cosmic view, inside the replay window, after Liber VI', () => {
    expect(isOverflowWitnessActive(EARLY, 'cosmic', true, LADDER, true)).toBe(true);
  });

  it('is never active unarmed — booting near t=0 is not witnessing', () => {
    expect(isOverflowWitnessActive(EARLY, 'cosmic', true, LADDER, false)).toBe(false);
  });

  it('requires the ladder flag from Liber VI', () => {
    expect(isOverflowWitnessActive(EARLY, 'cosmic', true, {}, true)).toBe(false);
    expect(
      isOverflowWitnessActive(EARLY, 'cosmic', true, { [OVERFLOW_LADDER_FLAG]: false }, true),
    ).toBe(false);
  });

  it('requires cosmic mode and a completed intro', () => {
    expect(isOverflowWitnessActive(EARLY, 'embodied', true, LADDER, true)).toBe(false);
    expect(isOverflowWitnessActive(EARLY, 'earth', true, LADDER, true)).toBe(false);
    expect(isOverflowWitnessActive(EARLY, 'cosmic', false, LADDER, true)).toBe(false);
  });

  it('ends outside the Big Bang replay window', () => {
    expect(isOverflowWitnessActive(LATE, 'cosmic', true, LADDER, true)).toBe(false);
    expect(
      isOverflowWitnessActive(BIG_BANG_REPLAY_END_SECONDS, 'cosmic', true, LADDER, true),
    ).toBe(false);
  });

  it('stays active for re-witnessing after the flag is recorded', () => {
    expect(
      isOverflowWitnessActive(
        EARLY,
        'cosmic',
        true,
        { ...LADDER, [OVERFLOW_WITNESSED_FLAG]: true },
        true,
      ),
    ).toBe(true);
  });
});

describe('shouldMarkOverflowWitnessed', () => {
  it('marks on first armed witnessing only', () => {
    expect(shouldMarkOverflowWitnessed(EARLY, 'cosmic', true, LADDER, true)).toBe(true);
    expect(
      shouldMarkOverflowWitnessed(
        EARLY,
        'cosmic',
        true,
        { ...LADDER, [OVERFLOW_WITNESSED_FLAG]: true },
        true,
      ),
    ).toBe(false);
  });

  it('never marks unarmed or outside the witnessing state', () => {
    expect(shouldMarkOverflowWitnessed(EARLY, 'cosmic', true, LADDER, false)).toBe(false);
    expect(shouldMarkOverflowWitnessed(LATE, 'cosmic', true, LADDER, true)).toBe(false);
    expect(shouldMarkOverflowWitnessed(EARLY, 'embodied', true, LADDER, true)).toBe(false);
    expect(shouldMarkOverflowWitnessed(EARLY, 'cosmic', true, {}, true)).toBe(false);
  });
});
