import { BIG_BANG_REPLAY_END_SECONDS } from './bigBangReplay';
import { FIRST_STARS_SECONDS } from './materialHeavens';
import type { ObserverMode } from './ObserverState';

/** Set when Liber VI (the Ladder and the Parable of the Overflow) completes. */
export const OVERFLOW_LADDER_FLAG = 'via-resonantiae-ladder';
/** Set once the player scrubs back to the Big Bang after learning the parable. */
export const OVERFLOW_WITNESSED_FLAG = 'overflow-witnessed';

/**
 * Witnessing must be armed by first standing in cosmic time after the first
 * stars — the game boots near t=0 (the intro Big Bang), and arriving there
 * by default is not the deliberate return the parable asks for.
 */
export const OVERFLOW_ARM_SECONDS = FIRST_STARS_SECONDS;

export type PathFlags = Record<string, string | number | boolean>;

export function isOverflowArmed(simTimeSeconds: number, introComplete: boolean): boolean {
  return introComplete && simTimeSeconds > OVERFLOW_ARM_SECONDS;
}

/**
 * The Overflow is witnessed by deliberately scrubbing back into the Big Bang
 * replay window in cosmic view after Liber VI — the moment the game's oldest
 * mechanic (scrubbing to the first light) becomes the Path's final teaching.
 */
export function isOverflowWitnessActive(
  simTimeSeconds: number,
  mode: ObserverMode,
  introComplete: boolean,
  pathFlags: PathFlags,
  armed: boolean,
): boolean {
  if (!armed || !introComplete || mode !== 'cosmic') return false;
  if (pathFlags[OVERFLOW_LADDER_FLAG] !== true) return false;
  return simTimeSeconds < BIG_BANG_REPLAY_END_SECONDS;
}

/** True the first time witnessing occurs — the moment to record the flag. */
export function shouldMarkOverflowWitnessed(
  simTimeSeconds: number,
  mode: ObserverMode,
  introComplete: boolean,
  pathFlags: PathFlags,
  armed: boolean,
): boolean {
  if (pathFlags[OVERFLOW_WITNESSED_FLAG] === true) return false;
  return isOverflowWitnessActive(simTimeSeconds, mode, introComplete, pathFlags, armed);
}
