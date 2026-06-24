import { useEffect, useState } from 'react';
import { getEventById } from '../data/history/index';
import { getNearestSiteMarker } from '../data/embodied/siteMarkers';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { useIntroActive } from '../core/IntroSkipHandler';

export function EmbodiedPrompt() {
  const mode = useObserverStore((s) => s.mode);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const introActive = useIntroActive();
  const [nearbyId, setNearbyId] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'embodied') {
      setNearbyId(null);
      return;
    }
    const marker = getNearestSiteMarker(avatarPosition.x, avatarPosition.z);
    setNearbyId(marker?.eventId ?? null);
  }, [mode, avatarPosition.x, avatarPosition.z]);

  useEffect(() => {
    if (mode !== 'embodied' || introActive || !nearbyId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e') return;
      const event = getEventById(nearbyId);
      if (!event) return;
      const history = useHistoryStore.getState();
      history.setHistoryTrack('spiritual');
      history.setDepthOfView('full');
      history.selectEvent(nearbyId, 'spiritual');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, introActive, nearbyId]);

  if (mode !== 'embodied' || !nearbyId) return null;

  const event = getEventById(nearbyId);
  if (!event) return null;

  return (
    <div className="embodied-prompt ui-panel">
      <span className="embodied-prompt-key">E</span>
      <span>Discover: {event.title}</span>
    </div>
  );
}
