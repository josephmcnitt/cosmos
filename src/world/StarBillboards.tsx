import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getStarTexture } from './starPoints';

const dummy = new THREE.Object3D();
const position = new THREE.Vector3();

export interface StarBillboardsProps {
  positions: Float32Array;
  color: string;
  opacity: number;
  /** Target on-screen diameter in CSS pixels. */
  pixelSize: number;
}

/** Screen-sized star sprites — avoids WebGL aliased point size clamping to 1px. */
export function StarBillboards({ positions, color, opacity, pixelSize }: StarBillboardsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = positions.length / 3;
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const texture = useMemo(() => getStarTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        color,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
        side: THREE.DoubleSide,
      }),
    [texture, color],
  );
  const { camera, size } = useThree();

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || opacity <= 0.01 || count <= 0) return;

    material.opacity = opacity;

    const persp = camera as THREE.PerspectiveCamera;
    const fovRad = (persp.fov * Math.PI) / 180;
    const height = Math.max(1, size.height);

    for (let i = 0; i < count; i++) {
      position.set(positions[i * 3]!, positions[i * 3 + 1]!, positions[i * 3 + 2]!);
      const dist = Math.max(0.1, persp.position.distanceTo(position));
      const worldSize = (pixelSize * 2 * dist * Math.tan(fovRad / 2)) / height;
      dummy.position.copy(position);
      dummy.lookAt(camera.position);
      dummy.scale.set(worldSize, worldSize, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (opacity <= 0.01 || count <= 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
