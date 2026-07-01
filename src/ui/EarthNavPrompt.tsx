import { useMemo } from 'react';
import { getEarthDescentEligibility } from '../core/earth/descent';
import { isEarthGlobeEnabled } from '../core/earth/feature';
import { getSpatialBand } from '../core/ScaleSpace';
import { useObserverStore } from '../core/ObserverState';
import { getPolitiesAtTime, getSiteAnchorsAtTimeForPack } from '../data/earth';
import { getAgeById } from '../data/ages';

/** Shown when zoomed to planetary scale in cosmic mode — the preview sphere is not the globe yet. */
export function EarthGlobePrompt() {
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const enterEarthMode = useObserverStore((s) => s.enterEarthMode);

  if (!isEarthGlobeEnabled() || mode !== 'cosmic') return null;

  const bandId = getSpatialBand(spatialExponent).id;
  if (bandId !== 'planetary' && bandId !== 'terrestrial' && bandId !== 'stellar') return null;

  return (
    <div className="earth-globe-prompt ui-panel" data-testid="earth-globe-prompt">
      <span>
        {bandId === 'stellar'
          ? 'Keep zooming in — the Earth globe opens at planetary scale'
          : 'Click the planet or open the historical globe'}
      </span>
      <button type="button" className="hud-earth-nav-btn" onClick={() => enterEarthMode()}>
        Open Earth globe →
      </button>
    </div>
  );
}

export function EarthNavPrompt() {
  const mode = useObserverStore((s) => s.mode);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const setGeoFocus = useObserverStore((s) => s.setGeoFocus);
  const count = useMemo(() => getPolitiesAtTime(simTimeSeconds).length, [simTimeSeconds]);
  const sites = useMemo(
    () => getSiteAnchorsAtTimeForPack(simTimeSeconds),
    [simTimeSeconds],
  );

  if (mode !== 'earth') return null;

  return (
    <div
      className="earth-nav-prompt ui-panel"
      data-testid="earth-nav-prompt"
      data-polity-count={count}
    >
      <span>Drag to rotate · Scroll to zoom · Click a site pin</span>
      <div className="earth-site-list">
        {sites.map((site) => (
          <button
            key={site.id}
            type="button"
            className="earth-site-btn"
            data-testid={`earth-pin-${site.id}`}
            onClick={() =>
              setGeoFocus({
                lat: site.geo.lat,
                lng: site.geo.lng,
                siteAnchorId: site.id,
                ageId: site.ageId,
                label: site.geo.label,
              })
            }
          >
            {site.geo.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EarthDetailPanel() {
  const mode = useObserverStore((s) => s.mode);
  const earthPhase = useObserverStore((s) => s.earthPhase);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const geoFocus = useObserverStore((s) => s.geoFocus);
  const clearGeoFocus = useObserverStore((s) => s.clearGeoFocus);
  const beginEarthDescent = useObserverStore((s) => s.beginEarthDescent);

  const eligibility = useMemo(
    () => getEarthDescentEligibility(geoFocus, simTimeSeconds),
    [geoFocus, simTimeSeconds],
  );

  if (mode !== 'earth' || !geoFocus || earthPhase === 'descent') return null;

  const age = geoFocus.ageId ? getAgeById(geoFocus.ageId) : undefined;

  return (
    <div className="earth-detail-panel ui-panel" data-testid="earth-detail-panel">
      <div className="earth-detail-header">
        <strong>{geoFocus.label}</strong>
        <button type="button" className="earth-detail-close" onClick={clearGeoFocus} aria-label="Close">
          ×
        </button>
      </div>
      {age && (
        <p className="earth-detail-age">
          Playable age: {age.title} ({age.eraLabel})
        </p>
      )}
      <p className="earth-detail-coords hud-muted">
        {geoFocus.lat.toFixed(1)}°N, {geoFocus.lng.toFixed(1)}°E
      </p>
      {eligibility.reason && !eligibility.canDescend && (
        <p className="earth-detail-blocked hud-muted" data-testid="earth-descend-blocked">
          {eligibility.reason}
        </p>
      )}
      <button
        type="button"
        className={`earth-descend-btn${eligibility.canDescend ? ' earth-descend-btn--ready' : ''}`}
        data-testid="earth-descend-btn"
        disabled={!eligibility.canDescend}
        onClick={() => beginEarthDescent()}
      >
        {eligibility.canDescend ? 'Descend → walk' : 'Descend unavailable'}
      </button>
    </div>
  );
}
