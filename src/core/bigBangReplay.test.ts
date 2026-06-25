import { describe, expect, it } from 'vitest';
import { yearsAfterBB } from '../data/history/time';
import {
  bigBangReplayFrame,
  BIG_BANG_REPLAY_END_SECONDS,
  isBigBangReplayActive,
} from './bigBangReplay';
import { FIRST_STARS_SECONDS } from './materialHeavens';

describe('bigBangReplay', () => {
  it('active at sim time zero in cosmic mode', () => {
    expect(isBigBangReplayActive(0, 'cosmic', true)).toBe(true);
    expect(isBigBangReplayActive(0, 'embodied', true)).toBe(false);
  });

  it('inactive after replay window', () => {
    expect(bigBangReplayFrame(BIG_BANG_REPLAY_END_SECONDS)).toBeNull();
    expect(isBigBangReplayActive(FIRST_STARS_SECONDS, 'cosmic', true)).toBe(false);
  });

  it('burstT advances with sim time', () => {
    const early = bigBangReplayFrame(0)!;
    const mid = bigBangReplayFrame(yearsAfterBB(30e6))!;
    expect(mid.burstT).toBeGreaterThan(early.burstT);
  });
});
