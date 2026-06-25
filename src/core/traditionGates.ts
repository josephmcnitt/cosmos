import type { SpiritualTradition } from '../data/history/types';
import type { ObserverMode } from './ObserverState';
import { isNearPresent } from './heavenVisibility';
import { isInHumanEra } from './spatialTimeCoupling';

export interface TraditionGateContext {
  tradition: SpiritualTradition;
  spiritualDepth: number;
  sessionsCompleted: number;
  simTimeSeconds: number;
  spatialExponent: number;
  mode: ObserverMode;
}

/** Per-tradition ritual thresholds — Phase 10 MVP (not one global zodiac gate). */
export function meetsTraditionGate(ctx: TraditionGateContext): boolean {
  const { tradition, spiritualDepth, sessionsCompleted } = ctx;

  switch (tradition) {
    case 'platonism':
    case 'neoplatonism':
      return sessionsCompleted >= 1 && spiritualDepth >= 0.25;
    case 'hermetic':
      return sessionsCompleted >= 2 && spiritualDepth >= 0.32;
    case 'kabbalah':
      return spiritualDepth >= 0.38 && sessionsCompleted >= 1;
    case 'gnosticism':
      return spiritualDepth >= 0.45 && sessionsCompleted >= 1;
    case 'alchemy':
      return sessionsCompleted >= 2 && spiritualDepth >= 0.3;
    default:
      return sessionsCompleted >= 1 && spiritualDepth >= 0.28;
  }
}

export interface CorrespondenceLensContext {
  spiritualDepth: number;
  sessionsCompleted: number;
  simTimeSeconds: number;
  spatialExponent: number;
  mode: ObserverMode;
  introComplete: boolean;
  dominantTradition: SpiritualTradition | null;
}

/** Correspondence sky after meaningful practice — cosmic view, human-era present. */
export function isCorrespondenceLensActive(ctx: CorrespondenceLensContext): boolean {
  if (!ctx.introComplete || ctx.mode !== 'cosmic') return false;
  if (ctx.sessionsCompleted < 1 || ctx.spiritualDepth < 0.22) return false;
  if (!isInHumanEra(ctx.simTimeSeconds) || !isNearPresent(ctx.simTimeSeconds)) return false;
  if (ctx.spatialExponent < 8 || ctx.spatialExponent >= 22) return false;

  if (ctx.dominantTradition) {
    return meetsTraditionGate({
      tradition: ctx.dominantTradition,
      spiritualDepth: ctx.spiritualDepth,
      sessionsCompleted: ctx.sessionsCompleted,
      simTimeSeconds: ctx.simTimeSeconds,
      spatialExponent: ctx.spatialExponent,
      mode: ctx.mode,
    });
  }

  return ctx.spiritualDepth >= 0.35;
}
