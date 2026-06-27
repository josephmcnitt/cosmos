import { useEffect, useState } from 'react';
import { getActorForWorld } from '../data/actors/index';
import { useIntroActive } from '../core/IntroSkipHandler';
import { useObserverStore } from '../core/ObserverState';
import { getNearestActor } from '../core/world/worldQueries';
import { useWorldStore } from '../core/world/WorldState';

export function NpcInteractionControls() {
  const introActive = useIntroActive();
  const mode = useObserverStore((s) => s.mode);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const startInitiation = useWorldStore((s) => s.startInitiation);
  const getInitiationStatus = useWorldStore((s) => s.getInitiationStatus);
  const activeInitiation = useWorldStore((s) => s.activeInitiation);
  const [nearbyActorId, setNearbyActorId] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'embodied') {
      setNearbyActorId(null);
      return;
    }
    const actor = getNearestActor(avatarPosition.x, avatarPosition.z);
    setNearbyActorId(actor?.id ?? null);
  }, [mode, avatarPosition.x, avatarPosition.z]);

  useEffect(() => {
    if (mode !== 'embodied' || introActive || !nearbyActorId || activeInitiation) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 't') return;
      const status = getInitiationStatus(currentWorldId);
      if (status !== 'available') return;
      const actor = getActorForWorld(currentWorldId);
      if (!actor) return;
      startInitiation(actor.initiationId);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    mode,
    introActive,
    nearbyActorId,
    activeInitiation,
    currentWorldId,
    getInitiationStatus,
    startInitiation,
  ]);

  return null;
}

export function useNearbyNpcPrompt(): { displayName: string } | null {
  const mode = useObserverStore((s) => s.mode);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const status = useWorldStore((s) => s.initiationStatus[currentWorldId]);
  const activeInitiation = useWorldStore((s) => s.activeInitiation);

  if (mode !== 'embodied' || status !== 'available' || activeInitiation) return null;
  const actor = getNearestActor(avatarPosition.x, avatarPosition.z);
  if (!actor) return null;
  const def = getActorForWorld(currentWorldId);
  if (!def) return null;
  return { displayName: def.displayName };
}
