import { useMemo } from 'react';
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
  const revealedMarkerIds = useWorldStore((s) => s.revealedMarkerIds);
  const visibleMarkerIds = useMemo(
    () =>
      entities
        .filter((entity) => entity.worldId === currentWorldId && entity.kind === 'marker')
        .filter(
          (entity) =>
            entity.state.progressHidden !== true ||
            entity.state.progressRevealed === true ||
            revealedMarkerIds.includes(entity.id),
        )
        .map((entity) => entity.id),
    [currentWorldId, entities, revealedMarkerIds],
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
