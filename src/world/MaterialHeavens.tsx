import { useMemo } from 'react';
import { computeHeavenVisuals } from '../core/materialHeavens';
import { useObserverStore } from '../core/ObserverState';
import { WorldRoot } from './WorldRoot';

export function MaterialHeavens() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const visuals = useMemo(() => computeHeavenVisuals(simTimeSeconds), [simTimeSeconds]);
  const showBandMeshes = spatialExponent < 22;

  if (!showBandMeshes) return null;

  return (
    <WorldRoot modifiers={{ bandScale: visuals.bandScale, ambientScale: visuals.ambientScale }} />
  );
}
