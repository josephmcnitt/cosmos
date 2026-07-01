import { useObserverStore } from '../core/ObserverState';

/** Brief HUD while the globe dive transition runs. */
export function EarthDescentOverlay() {
  const earthPhase = useObserverStore((s) => s.earthPhase);
  const geoFocus = useObserverStore((s) => s.geoFocus);

  if (earthPhase !== 'descent' || !geoFocus) return null;

  return (
    <div className="earth-descent-overlay ui-panel" data-testid="earth-descent-overlay">
      <span>Descending to {geoFocus.label}…</span>
    </div>
  );
}
