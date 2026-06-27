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
  const age = getActiveAgeDefinition(currentWorldId);

  if (mode !== 'embodied') return null;

  const seekGuide = initiationStatus === 'available' || initiationStatus === 'in_progress';

  return (
    <div className="embodied-overlay ui-panel">
      <div className="embodied-age-label" data-testid="embodied-age-label">
        {age.title} · {age.eraLabel} · {worldLayer} layer
      </div>
      {seekGuide && !isAgeInitiated && (
        <div className="embodied-initiation-hint" data-testid="embodied-initiation-hint">
          Seek the guide in the clearing · Press <strong>T</strong> to speak
        </div>
      )}
      <div className="embodied-overlay-hint">
        {isAgeInitiated ? (
          <>
            <strong>W/S</strong> walk · <strong>A/D</strong> turn · <strong>E</strong> discover ·{' '}
            <strong>Q</strong> practice · <strong>Tab</strong> veil · <strong>R</strong> puzzle ·{' '}
            <strong>F</strong> travel · scroll zoom out to exit
          </>
        ) : (
          <>
            <strong>W/S</strong> walk · <strong>A/D</strong> turn · <strong>T</strong> speak with guide
            · scroll zoom out to exit
          </>
        )}
      </div>
      <button type="button" className="embodied-exit-btn" onClick={exitEmbodied}>
        Zoom out to cosmos
      </button>
    </div>
  );
}
