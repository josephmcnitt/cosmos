import * as THREE from 'three';

let starTexture: THREE.CanvasTexture | null = null;

export function getStarTexture(): THREE.CanvasTexture {
  if (starTexture) return starTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  starTexture = new THREE.CanvasTexture(canvas);
  return starTexture;
}

export function starPointsMaterial(
  color: string,
  size: number,
  opacity: number,
): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    size,
    color,
    map: getStarTexture(),
    transparent: true,
    opacity,
    sizeAttenuation: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
}
