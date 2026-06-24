import { Grid } from '@react-three/drei';
import { useObserverStore } from '../core/ObserverState';

export function DebugGrid() {
  const show = useObserverStore((s) => s.showDebugGrid);
  if (!show) return null;

  return (
    <Grid
      infiniteGrid
      cellSize={1}
      sectionSize={10}
      fadeDistance={80}
      fadeStrength={1.5}
      cellColor="#334455"
      sectionColor="#556677"
      position={[0, -0.01, 0]}
    />
  );
}
