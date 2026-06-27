import type { InitiationStep } from './types';

export function normalizeYaw(yaw: number): number {
  let y = yaw % (Math.PI * 2);
  if (y > Math.PI) y -= Math.PI * 2;
  if (y < -Math.PI) y += Math.PI * 2;
  return y;
}

export function yawMatches(current: number, target: number, tolerance: number): boolean {
  const diff = Math.abs(normalizeYaw(current - target));
  return diff <= tolerance;
}

export function distanceXZ(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x1 - x2;
  const dz = z1 - z2;
  return Math.sqrt(dx * dx + dz * dz);
}

export interface StepCheckContext {
  playerX: number;
  playerZ: number;
  playerYaw: number;
  avatarMoving: boolean;
  stepStartedAt: number;
  choiceId?: string;
  keysPressedSinceStep: boolean;
}

export function isStepComplete(step: InitiationStep, ctx: StepCheckContext): boolean {
  switch (step.type) {
    case 'dialogue':
      return true;
    case 'choose':
      return ctx.choiceId != null && step.options.some((o) => o.id === ctx.choiceId);
    case 'walk-to':
      return distanceXZ(ctx.playerX, ctx.playerZ, step.targetX, step.targetZ) <= (step.radius ?? 3);
    case 'hold-still':
      if (ctx.avatarMoving || ctx.keysPressedSinceStep) return false;
      return (performance.now() - ctx.stepStartedAt) / 1000 >= step.durationSec;
    case 'face-direction':
      return yawMatches(ctx.playerYaw, step.targetYaw, step.tolerance ?? 0.5);
    case 'silence':
      if (ctx.keysPressedSinceStep) return false;
      return (performance.now() - ctx.stepStartedAt) / 1000 >= step.durationSec;
    default:
      return false;
  }
}

export function isChooseCorrect(
  step: Extract<InitiationStep, { type: 'choose' }>,
  choiceId: string,
): boolean {
  const opt = step.options.find((o) => o.id === choiceId);
  if (!opt) return false;
  if (hasCorrectAnswer(step)) return opt.correct === true;
  return true;
}

function hasCorrectAnswer(step: Extract<InitiationStep, { type: 'choose' }>): boolean {
  return step.options.some((o) => o.correct === true);
}

/** Branching choices advance on any selection; quiz steps require the correct option. */
export function isChooseResolved(
  step: Extract<InitiationStep, { type: 'choose' }>,
  choiceId: string,
): boolean {
  return isChooseCorrect(step, choiceId);
}

export function canAutoAdvance(step: InitiationStep): boolean {
  return step.type === 'dialogue';
}

import { ALL_AGES } from '../../data/ages/index';

export function defaultInitiationStatus(): Record<string, import('./types').InitiationStatus> {
  const status: Record<string, import('./types').InitiationStatus> = {};
  for (const age of ALL_AGES) {
    status[age.id] = age.id === 'grove' ? 'available' : 'locked';
  }
  return status;
}

export function migrateInitiationStatus(
  existing?: Record<string, import('./types').InitiationStatus>,
): Record<string, import('./types').InitiationStatus> {
  const defaults = defaultInitiationStatus();
  if (!existing) return defaults;
  return { ...defaults, ...existing };
}
