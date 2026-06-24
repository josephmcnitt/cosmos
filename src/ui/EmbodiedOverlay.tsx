import { useObserverStore } from '../core/ObserverState';

export function EmbodiedOverlay() {
  const mode = useObserverStore((s) => s.mode);
  const exitEmbodied = useObserverStore((s) => s.exitEmbodied);

  if (mode !== 'embodied') return null;

  return (
    <div className="embodied-overlay ui-panel">
      <div className="embodied-overlay-hint">
        <strong>W/S</strong> walk · <strong>A/D</strong> turn · <strong>E</strong> discover ·{' '}
        <strong>Q</strong> hold to practice · <strong>scroll</strong> zoom out to cosmos
      </div>
      <button type="button" className="embodied-exit-btn" onClick={exitEmbodied}>
        Zoom out to cosmos
      </button>
    </div>
  );
}
