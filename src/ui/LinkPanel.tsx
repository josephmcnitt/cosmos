import { useEffect } from 'react';
import { useHistoryStore } from '../core/HistoryState';
import { useOverlayPanelStore } from '../core/OverlayPanelState';
import { getActiveAgeDefinition } from '../core/world/WorldRegistry';
import { useWorldStore } from '../core/world/WorldState';

export function LinkPanel() {
  const expandedPanel = useOverlayPanelStore((s) => s.expandedPanel);
  const linkPortalId = useOverlayPanelStore((s) => s.linkPortalId);
  const openPanel = useOverlayPanelStore((s) => s.openPanel);
  const closePanel = useOverlayPanelStore((s) => s.closePanel);
  const selectEvent = useHistoryStore((s) => s.selectEvent);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const entities = useWorldStore((s) => s.entities);
  const travelToWorld = useWorldStore((s) => s.travelToWorld);
  const setAgeTransitionActive = useWorldStore((s) => s.setAgeTransitionActive);

  const portals = entities.filter(
    (e) => e.worldId === currentWorldId && e.kind === 'portal' && e.state.unlocked === true,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'f') return;
      const unlocked = portals.filter((p) => p.state.unlocked === true);
      if (unlocked.length === 0) return;
      const portal = unlocked[0]!;
      selectEvent(null);
      openPanel('link', { linkPortalId: portal.id });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [portals, openPanel, selectEvent]);

  if (expandedPanel !== 'link' || !linkPortalId) return null;

  const portal = portals.find((p) => p.id === linkPortalId);
  if (!portal) return null;

  const targetAge = getActiveAgeDefinition(portal.defId);

  const handleTravel = () => {
    setAgeTransitionActive(true);
    setTimeout(() => {
      travelToWorld(portal.defId);
      setAgeTransitionActive(false);
      closePanel();
    }, 800);
  };

  return (
    <div className="link-panel ui-panel" data-testid="link-panel">
      <h3>{portal.state.label as string}</h3>
      <p>
        Correspondence opens to {targetAge.title} ({targetAge.eraLabel})
      </p>
      <button type="button" data-testid="link-travel" onClick={handleTravel}>
        Travel (F)
      </button>
      <button type="button" onClick={closePanel}>
        Close
      </button>
    </div>
  );
}
