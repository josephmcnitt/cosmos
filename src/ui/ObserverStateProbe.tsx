import { isEarthGlobeEnabled } from '../core/earth/feature';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

/** Hidden DOM probe for E2E — reflects live observer mode without window store hooks. */
export function ObserverStateProbe() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const entities = useWorldStore((s) => s.entities);
  const revealedMarkerIds = useWorldStore((s) => s.revealedMarkerIds);

  if (!introComplete) return null;

  const hiddenMarkerProbes = entities
    .filter((entity) => entity.kind === 'marker' && entity.state.progressHidden === true)
    .map((entity) => {
      const visible =
        entity.state.progressRevealed === true || revealedMarkerIds.includes(entity.id);
      return { id: entity.id, visible };
    });

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
      {hiddenMarkerProbes.map((marker) => (
        <div
          key={marker.id}
          data-testid={`marker-${marker.id}-visible`}
          data-visible={marker.visible ? '1' : '0'}
          hidden
          aria-hidden
        />
      ))}
    </>
  );
}
