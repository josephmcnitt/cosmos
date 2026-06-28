import { meetsTraditionGate } from './traditionGates';
import { SPIRITUAL_SUSTAIN_SEC } from './practice';
import type { ObserverMode } from './ObserverState';
import type { SpiritualTradition } from '../data/history/types';

export interface SplitReadinessContext {
  mode: ObserverMode;
  initiated: boolean;
  worldLayer: 'material' | 'esoteric';
  realmPhase: 'material' | 'liminal' | 'spiritual';
  sustainElapsedSec: number;
  spiritualDepth: number;
  sessionsCompleted: number;
  simTimeSeconds: number;
  spatialExponent: number;
  dominantTradition: SpiritualTradition | null;
  entanglementsCount: number;
}

export interface SplitRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function splitRequirements(ctx: SplitReadinessContext): SplitRequirement[] {
  const traditionMet =
    ctx.dominantTradition != null &&
    meetsTraditionGate({
      tradition: ctx.dominantTradition,
      spiritualDepth: ctx.spiritualDepth,
      sessionsCompleted: ctx.sessionsCompleted,
      simTimeSeconds: ctx.simTimeSeconds,
      spatialExponent: ctx.spatialExponent,
      mode: ctx.mode,
    });

  return [
    {
      id: 'esoteric',
      label: 'Tab → esoteric layer',
      met: ctx.worldLayer === 'esoteric',
    },
    {
      id: 'spiritual',
      label: `Hold Q to spiritual realm (~${SPIRITUAL_SUSTAIN_SEC}s)`,
      met: ctx.realmPhase === 'spiritual' && ctx.sustainElapsedSec >= SPIRITUAL_SUSTAIN_SEC,
    },
    {
      id: 'tradition',
      label: 'Enough practice depth for your tradition',
      met: traditionMet,
    },
    {
      id: 'free',
      label: 'No active astral split',
      met: ctx.entanglementsCount === 0,
    },
  ];
}

export function canPerformSplit(ctx: SplitReadinessContext): boolean {
  if (ctx.mode !== 'embodied' || !ctx.initiated || ctx.entanglementsCount > 0) return false;
  return splitRequirements(ctx).every((r) => r.met);
}

export function nextSplitRequirement(ctx: SplitReadinessContext): SplitRequirement | null {
  return splitRequirements(ctx).find((r) => !r.met) ?? null;
}

export function showSplitPrep(ctx: SplitReadinessContext): boolean {
  if (ctx.mode !== 'embodied' || !ctx.initiated) return false;
  if (ctx.entanglementsCount > 0) return true;
  if (ctx.worldLayer !== 'esoteric') return false;
  if (canPerformSplit(ctx)) return true;
  return ctx.spiritualDepth >= 0.2 && ctx.sessionsCompleted >= 1;
}
