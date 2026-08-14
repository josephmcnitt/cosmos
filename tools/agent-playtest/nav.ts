/**
 * Keyboard-navigation planning for the embodied avatar.
 *
 * Movement model (mirrors src/input/EmbodiedControls.tsx):
 *   heading vector = (sin yaw, cos yaw)
 *   'w' moves along heading; 'a' increases yaw, 'd' decreases yaw.
 */

export interface NavStep {
  /** Turn key to hold this pulse, if any. */
  turn: 'a' | 'd' | null;
  /** Whether to hold 'w' this pulse. */
  forward: boolean;
  /** Remaining distance to the target. */
  distance: number;
  /** Signed yaw error in radians, normalized to [-PI, PI]. */
  angleError: number;
}

export const ARRIVE_DISTANCE = 2.0;
/** Turn toward the target while the yaw error exceeds this. */
export const TURN_THRESHOLD = 0.15;
/** Only move forward once roughly facing the target. */
export const FORWARD_THRESHOLD = 0.6;

export function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export function planNavStep(
  avatarX: number,
  avatarZ: number,
  avatarYaw: number,
  targetX: number,
  targetZ: number,
): NavStep {
  const dx = targetX - avatarX;
  const dz = targetZ - avatarZ;
  const distance = Math.hypot(dx, dz);
  const desiredYaw = Math.atan2(dx, dz);
  const angleError = normalizeAngle(desiredYaw - avatarYaw);

  if (distance <= ARRIVE_DISTANCE) {
    return { turn: null, forward: false, distance, angleError };
  }

  const turn: NavStep['turn'] =
    Math.abs(angleError) > TURN_THRESHOLD ? (angleError > 0 ? 'a' : 'd') : null;
  const forward = Math.abs(angleError) < FORWARD_THRESHOLD;
  return { turn, forward, distance, angleError };
}
