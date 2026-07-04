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
  const visibleMarkerIds = useWorldStore((s) =>
    s.entities
      .filter((entity) => entity.worldId === s.currentWorldId && entity.kind === 'marker')
      .filter((entity) => s.isMarkerVisible(entity.id))
      .map((entity) => entity.id),
  );

  if (!introComplete) return null;

  return (
    <>
      <div
        data-testid="observer-state-probe"
        data-mode={mode}
        data-spatial-exponent={spatialExponent.toFixed(2)}
        data-earth-enabled={isEarthGlobeEnabled() ? '1' : '0'}
        data-world-id={currentWorldId}
        hidden
        aria-hidden
      />
      {visibleMarkerIds.map((markerId) => (
        <div
          key={markerId}
          data-testid={`marker-${markerId}-visible`}
          hidden
          aria-hidden
        />
      ))}
    </>
  );
}
