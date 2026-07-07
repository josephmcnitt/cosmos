import { useWorldStore } from '../core/world/WorldState';

/** Hidden DOM probes for E2E marker-visibility assertions over Three.js content. */
export function VisibleMarkerProbe() {
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const entities = useWorldStore((s) => s.entities);
  const initiated = useWorldStore((s) => s.isAgeInitiated(currentWorldId));
  const isMarkerVisible = useWorldStore((s) => s.isMarkerVisible);

  if (!initiated) return null;

  const visibleMarkers = entities.filter(
    (entity) =>
      entity.worldId === currentWorldId &&
      entity.kind === 'marker' &&
      entity.layer === 'material' &&
      isMarkerVisible(entity.id),
  );

  return (
    <>
      {visibleMarkers.map((marker) => (
        <span
          key={marker.id}
          data-testid={`marker-${marker.id}-visible`}
          hidden
          aria-hidden
        />
      ))}
    </>
  );
}
