import { useMemo } from 'react';
import { computeHeavenVisuals } from '../core/materialHeavens';
import { starfieldBrightness } from '../core/heavenVisibility';
import { useObserverStore } from '../core/ObserverState';
import { StarBillboards } from './StarBillboards';

function buildScatterLayer(
  count: number,
  spread: number,
  depth: number,
  size: number,
  color: string,
  opacity: number,
): {
  positions: Float32Array;
  size: number;
  color: string;
  opacity: number;
} {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.55;
    positions[i * 3 + 2] = -(depth * 0.25 + Math.random() * depth);
  }
  return { positions, size, color, opacity };
}

/** Universe-scale starfield — distant shells only; near parallax stars live in FlightStarfield. */
export function CosmicStarfield() {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTime = useObserverStore((s) => s.simTimeSeconds);

  const layers = useMemo(
    () => [
      buildScatterLayer(1400, 900, 1100, 1.1, '#b8c8ff', 0.35),
      buildScatterLayer(700, 260, 320, 0.9, '#dfe4ff', 0.55),
    ],
    [],
  );

  const brightness = useMemo(() => {
    const { starfieldOpacity } = computeHeavenVisuals(simTime);
    return starfieldBrightness(starfieldOpacity);
  }, [simTime]);

  const universeFade =
    spatialExponent > 22 ? Math.max(0, 1 - (spatialExponent - 22) / 3) : 1;
  const layerOpacity = brightness * universeFade;

  return (
    <group>
      {layers.map((layer, i) => (
        <StarBillboards
          key={i}
          positions={layer.positions}
          color={layer.color}
          opacity={layer.opacity * layerOpacity}
          pixelSize={layer.size * 3.2}
        />
      ))}
    </group>
  );
}
