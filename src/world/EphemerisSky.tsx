import { useMemo } from 'react';
import { azAltToDirection, computeEphemeris } from '../core/ephemeris';
import { isEphemerisBand } from '../core/heavenVisibility';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

const SKY_RADIUS = 280;

function SkyBody({
  direction,
  color,
  size,
  opacity = 1,
}: {
  direction: [number, number, number];
  color: string;
  size: number;
  opacity?: number;
}) {
  const [x, y, z] = direction;
  const scale = size;
  return (
    <mesh position={[x * SKY_RADIUS, y * SKY_RADIUS, z * SKY_RADIUS]}>
      <sphereGeometry args={[scale, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} depthWrite={false} fog={false} />
    </mesh>
  );
}

function MoonDisc({
  direction,
  phase,
}: {
  direction: [number, number, number];
  phase: number;
}) {
  const [x, y, z] = direction;
  const pos: [number, number, number] = [x * SKY_RADIUS, y * SKY_RADIUS, z * SKY_RADIUS];
  const litOpacity = 0.35 + 0.55 * (1 - Math.abs(phase - 0.5) * 2);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[3.2, 16, 16]} />
        <meshBasicMaterial color="#c8d4e8" transparent opacity={litOpacity} toneMapped={false} depthWrite={false} fog={false} />
      </mesh>
      {phase > 0.55 && (
        <mesh position={[phase > 0.75 ? 1.2 : -1.2, 0, 0.5]}>
          <sphereGeometry args={[3.0, 12, 12]} />
          <meshBasicMaterial color="#020408" transparent opacity={0.85} toneMapped={false} depthWrite={false} fog={false} />
        </mesh>
      )}
    </group>
  );
}

export function EphemerisSky() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const mode = useObserverStore((s) => s.mode);
  const introComplete = useIntroStore((s) => s.phase === 'complete');

  const active = isEphemerisBand(simTimeSeconds, spatialExponent, mode, introComplete);

  const eph = useMemo(() => computeEphemeris(), []);

  if (!active) return null;

  const sunDir = azAltToDirection(eph.sunAzimuth, eph.sunAltitude);
  const moonDir = azAltToDirection(eph.moonAzimuth, eph.moonAltitude);

  return (
    <group name="ephemeris-sky">
      {eph.sunAltitude > -0.05 && (
        <SkyBody direction={sunDir} color="#ffd080" size={5.5} opacity={0.95} />
      )}
      {eph.moonAltitude > -0.05 && (
        <MoonDisc direction={moonDir} phase={eph.moonPhase} />
      )}
    </group>
  );
}
