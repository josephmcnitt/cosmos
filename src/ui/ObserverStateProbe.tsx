import { isEarthGlobeEnabled } from '../core/earth/feature';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

/** Hidden DOM probe for E2E — reflects live observer mode without window store hooks. */
export function ObserverStateProbe() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const markerEntities = useWorldStore((s) => s.entities.filter((e) => e.kind === 'marker'));
  const revealedMarkerIds = useWorldStore((s) => s.revealedMarkerIds);

  if (!introComplete) return null;

  return (
    <div
      data-testid="observer-state-probe"
      data-mode={mode}
      data-spatial-exponent={spatialExponent.toFixed(2)}
      data-earth-enabled={isEarthGlobeEnabled() ? '1' : '0'}
      hidden
      aria-hidden
    >
      {markerEntities.map((marker) => {
        const visible =
          marker.state.progressHidden !== true ||
          marker.state.progressRevealed === true ||
          revealedMarkerIds.includes(marker.id);
        return (
          <span
            key={marker.id}
            data-testid={`marker-${marker.id}-visible`}
            data-visible={visible ? '1' : '0'}
          >
            {visible ? 'true' : 'false'}
          </span>
        );
      })}
    </div>
  );
}
