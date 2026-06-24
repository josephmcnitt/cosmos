import { useEffect, useState } from 'react';
import { getEventById } from '../data/history/index';
import { getNearestSiteMarker } from '../data/embodied/siteMarkers';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';
import { useIntroActive } from '../core/IntroSkipHandler';

export function EmbodiedPrompt() {
  const mode = useObserverStore((s) => s.mode);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const introActive = useIntroActive();
  const activePractice = usePracticeStore((s) => s.activePractice);
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
      usePracticeStore.getState().markDiscovered(nearbyId);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, introActive, nearbyId]);

  if (mode !== 'embodied' || !nearbyId || activePractice) return null;

  const event = getEventById(nearbyId);
  if (!event) return null;

  return (
    <div className="embodied-prompt ui-panel">
      <div className="embodied-prompt-row">
        <span className="embodied-prompt-key">E</span>
        <span>Discover: {event.title}</span>
      </div>
      <div className="embodied-prompt-row embodied-prompt-row--secondary">
        <span className="embodied-prompt-key">Q</span>
        <span>Hold still · hold Q to practice (~12s)</span>
      </div>
    </div>
  );
}
