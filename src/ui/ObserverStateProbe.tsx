import { isEarthGlobeEnabled } from '../core/earth/feature';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

/** Hidden DOM probe for E2E — reflects live observer mode without window store hooks. */
export function ObserverStateProbe() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const entities = useWorldStore((s) => s.entities);
  const isMarkerVisible = useWorldStore((s) => s.isMarkerVisible);

  if (!introComplete) return null;

  const visibleMarkerIds =
    mode === 'embodied'
      ? entities
          .filter((e) => e.worldId === currentWorldId && e.kind === 'marker')
          .filter((e) => isMarkerVisible(e.id))
          .map((e) => e.id)
      : [];

  return (
    <>
      <div
        data-testid="observer-state-probe"
        data-mode={mode}
        data-spatial-exponent={spatialExponent.toFixed(2)}
        data-earth-enabled={isEarthGlobeEnabled() ? '1' : '0'}
        hidden
        aria-hidden
      />
      {visibleMarkerIds.map((markerId) => (
        <div
          key={markerId}
          data-testid={`marker-${markerId}-visible`}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
          aria-hidden
        />
      ))}
    </>
  );
}
