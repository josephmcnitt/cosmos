import { useMemo } from 'react';
import { MARKER_TRADITION_COLORS } from '../data/embodied/siteMarkers';
import { isCorrespondenceLensActive } from '../core/traditionGates';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';

const RING_RADIUS = 265;
const SEGMENTS = 12;

export function CorrespondenceSky() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const mode = useObserverStore((s) => s.mode);
  const spiritualDepth = usePracticeStore((s) => s.spiritualDepth);
  const sessionsCompleted = usePracticeStore((s) => s.sessionsCompleted);
  const dominantTradition = usePracticeStore((s) => s.dominantTradition);

  const active = useMemo(
    () =>
      isCorrespondenceLensActive({
        spiritualDepth,
        sessionsCompleted,
        simTimeSeconds,
        spatialExponent,
        mode,
        introComplete,
        dominantTradition,
      }),
    [
      spiritualDepth,
      sessionsCompleted,
      simTimeSeconds,
      spatialExponent,
      mode,
      introComplete,
      dominantTradition,
    ],
  );

  const color = dominantTradition
    ? MARKER_TRADITION_COLORS[dominantTradition]
    : '#c8a860';

  const ticks = useMemo(() => {
    if (!active) return [];
    const items: [number, number, number][] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const a = (i / SEGMENTS) * Math.PI * 2;
      const x = Math.sin(a) * RING_RADIUS;
      const z = -Math.cos(a) * RING_RADIUS;
      items.push([x, Math.sin(a * 2) * 5, z]);
    }
    return items;
  }, [active]);

  if (!active) return null;

  return (
    <group name="correspondence-sky">
      {ticks.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[2.4, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} toneMapped={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
}
