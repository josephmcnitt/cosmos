export interface WalkToHint {
  distanceM: number;
  bearingLabel: string;
  atTarget: boolean;
}

function normalizeAngle(rad: number): number {
  let a = rad;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/** Plain-language bearing from player facing to walk target. */
export function walkToHint(
  playerX: number,
  playerZ: number,
  playerYaw: number,
  targetX: number,
  targetZ: number,
  radius = 3,
): WalkToHint {
  const dx = targetX - playerX;
  const dz = targetZ - playerZ;
  const distanceM = Math.hypot(dx, dz);
  if (distanceM <= radius) {
    return { distanceM, bearingLabel: 'you are here', atTarget: true };
  }

  const angleToTarget = Math.atan2(dx, dz);
  const relative = normalizeAngle(angleToTarget - playerYaw);
  const abs = Math.abs(relative);

  let bearingLabel: string;
  if (abs < 0.35) bearingLabel = 'ahead';
  else if (abs > Math.PI - 0.35) bearingLabel = 'behind you';
  else if (relative > 0) bearingLabel = 'to your right';
  else bearingLabel = 'to your left';

  return {
    distanceM,
    bearingLabel,
    atTarget: false,
  };
}
