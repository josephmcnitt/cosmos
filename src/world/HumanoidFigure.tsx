import { useRef } from 'react';
import * as THREE from 'three';

export function HumanoidFigure({
  bodyColor = '#e8c4a0',
  robeColor,
  yaw = 0,
  position = [0, 0, 0] as [number, number, number],
  showEyes = true,
}: {
  bodyColor?: string;
  robeColor?: string;
  yaw?: number;
  position?: [number, number, number];
  showEyes?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} rotation={[0, yaw, 0]}>
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.25, 0.55, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {robeColor && (
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 0.5, 8]} />
          <meshStandardMaterial color={robeColor} roughness={0.85} />
        </mesh>
      )}
      {showEyes && (
        <>
          <mesh position={[-0.08, 0.22, 0.2]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#1a1a22" roughness={0.5} />
          </mesh>
          <mesh position={[0.08, 0.22, 0.2]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#1a1a22" roughness={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}
