import { useObserverStore } from '../core/ObserverState';
import { getActiveAgeDefinition } from '../core/world/WorldRegistry';
import { useWorldStore } from '../core/world/WorldState';

export function EmbodiedOverlay() {
  const mode = useObserverStore((s) => s.mode);
  const exitEmbodied = useObserverStore((s) => s.exitEmbodied);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const worldLayer = useWorldStore((s) => s.worldLayers[s.currentWorldId] ?? 'material');
  const initiationStatus = useWorldStore((s) => s.initiationStatus[currentWorldId]);
  const isAgeInitiated = useWorldStore((s) => s.isAgeInitiated(currentWorldId));
  const entities = useWorldStore((s) => s.entities);
  const revealedMarkerIds = useWorldStore((s) => s.revealedMarkerIds);
  const age = getActiveAgeDefinition(currentWorldId);

  if (mode !== 'embodied') return null;

  const seekGuide = initiationStatus === 'available' || initiationStatus === 'in_progress';
  const visibleMarkerIds = isAgeInitiated
    ? age.markers
        .filter((marker) => {
          const entity = entities.find((e) => e.id === marker.id && e.kind === 'marker');
          if (!entity) return false;
          if (entity.state.progressHidden !== true) return true;
          return entity.state.progressRevealed === true || revealedMarkerIds.includes(marker.id);
        })
        .map((marker) => marker.id)
    : [];

  return (
    <div className="embodied-overlay ui-panel">
      <div className="embodied-age-label" data-testid="embodied-age-label">
        {age.title} · {age.eraLabel} · {worldLayer} layer
      </div>
      {seekGuide && !isAgeInitiated && (
        <div className="embodied-initiation-hint" data-testid="embodied-initiation-hint">
          Walk toward the guide on the path — golden ring · Press <strong>T</strong> to speak
        </div>
      )}
      <div className="embodied-overlay-hint">
        {isAgeInitiated ? (
          <>
            <strong>W/S</strong> walk · <strong>Tab</strong> veil layer · scroll out to exit
          </>
        ) : (
          <>
            <strong>W/S</strong> walk · <strong>T</strong> speak with guide · scroll out to exit
          </>
        )}
      </div>
      <button type="button" className="embodied-exit-btn" onClick={exitEmbodied}>
        Zoom out to cosmos
      </button>
      {visibleMarkerIds.map((markerId) => (
        <span
          key={markerId}
          data-testid={`marker-${markerId}-visible`}
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
          aria-hidden="true"
        >
          {markerId}
        </span>
      ))}
    </div>
  );
}
