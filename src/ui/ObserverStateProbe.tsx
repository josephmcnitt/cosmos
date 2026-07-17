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

  const markers = entities.filter((e) => e.kind === 'marker' && e.worldId === currentWorldId);

  return (
    <div
      data-testid="observer-state-probe"
      data-mode={mode}
      data-spatial-exponent={spatialExponent.toFixed(2)}
      data-earth-enabled={isEarthGlobeEnabled() ? '1' : '0'}
      hidden
      aria-hidden
    >
      {markers.map((marker) => (
        <span
          key={marker.id}
          data-testid={`marker-${marker.id}-visible`}
          data-visible={isMarkerVisible(marker.id) ? 'true' : 'false'}
        />
      ))}
    </div>
  );
}
