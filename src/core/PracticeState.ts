import { create } from 'zustand';
import type { SpiritualTradition } from '../data/history/types';
import {
  DISCOVERED_BONUS,
  PRACTICE_DURATION_SEC,
  RESONANCE_GAIN,
  traditionForMarker,
} from './practice';
import { useWorldStore } from './world/WorldState';

export type RealmPhase = 'material' | 'liminal' | 'spiritual';

export interface ActivePractice {
  tradition: SpiritualTradition;
  eventId: string;
  startedAt: number;
  progress: number;
}

interface PracticeState {
  spiritualDepth: number;
  dominantTradition: SpiritualTradition | null;
  realmPhase: RealmPhase;
  activePractice: ActivePractice | null;
  sustainElapsedSec: number;
  avatarMoving: boolean;
  nearbyEventId: string | null;
  lastCompletedAt: number;

  syncFromWorld: () => void;
  markDiscovered: (eventId: string) => void;
  isDiscovered: (eventId: string) => boolean;
  setAvatarMoving: (moving: boolean) => void;
  setNearbyEventId: (eventId: string | null) => void;
  startPractice: (eventId: string) => boolean;
  tickPractice: (nowMs: number) => void;
  cancelPractice: () => void;
  completePractice: () => void;
  setSpiritualDepth: (depth: number) => void;
  setRealmPhase: (phase: RealmPhase) => void;
  setSustainElapsed: (sec: number) => void;
  resetSession: () => void;
}

const SESSION_INITIAL: Pick<
  PracticeState,
  | 'realmPhase'
  | 'activePractice'
  | 'sustainElapsedSec'
  | 'avatarMoving'
  | 'nearbyEventId'
  | 'lastCompletedAt'
> = {
  realmPhase: 'material',
  activePractice: null,
  sustainElapsedSec: 0,
  avatarMoving: false,
  nearbyEventId: null,
  lastCompletedAt: 0,
};

function syncDepthFromWorld() {
  const world = useWorldStore.getState();
  return {
    spiritualDepth: world.spiritualDepth,
    dominantTradition: world.dominantTradition,
  };
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  ...SESSION_INITIAL,
  ...syncDepthFromWorld(),

  syncFromWorld: () => set(syncDepthFromWorld()),

  markDiscovered: (eventId) => {
    useWorldStore.getState().markEventDiscovered(eventId);
  },

  isDiscovered: (eventId) => useWorldStore.getState().isEventDiscovered(eventId),

  setAvatarMoving: (moving) => set({ avatarMoving: moving }),

  setNearbyEventId: (eventId) =>
    set((s) => (s.nearbyEventId === eventId ? s : { nearbyEventId: eventId })),

  startPractice: (eventId) => {
    const tradition = traditionForMarker(eventId);
    if (!tradition) return false;
    set({
      activePractice: {
        tradition,
        eventId,
        startedAt: performance.now(),
        progress: 0,
      },
    });
    return true;
  },

  tickPractice: (nowMs) => {
    const { activePractice } = get();
    if (!activePractice) return;
    const elapsed = (nowMs - activePractice.startedAt) / 1000;
    const progress = Math.min(1, elapsed / PRACTICE_DURATION_SEC);
    if (progress >= 1) {
      get().completePractice();
      return;
    }
    set({ activePractice: { ...activePractice, progress } });
  },

  cancelPractice: () => set({ activePractice: null }),

  completePractice: () => {
    const { activePractice } = get();
    if (!activePractice) return;

    let gain = RESONANCE_GAIN;
    if (useWorldStore.getState().isEventDiscovered(activePractice.eventId)) {
      gain += DISCOVERED_BONUS;
    }

    useWorldStore.getState().addResonance(activePractice.tradition, gain);
    useWorldStore.getState().incrementSessions();

    set({
      activePractice: null,
      lastCompletedAt: performance.now(),
      ...syncDepthFromWorld(),
    });
  },

  setSpiritualDepth: (depth) => set({ spiritualDepth: depth }),

  setRealmPhase: (phase) => set({ realmPhase: phase }),

  setSustainElapsed: (sec) => set({ sustainElapsedSec: sec }),

  resetSession: () => set({ ...SESSION_INITIAL, ...syncDepthFromWorld() }),
}));

/** Resonance from persisted world state. */
export function getResonance(): Partial<Record<SpiritualTradition, number>> {
  return useWorldStore.getState().resonance;
}

export function getSessionsCompleted(): number {
  return useWorldStore.getState().sessionsCompleted;
}

export function getDiscoveredStones(): string[] {
  return useWorldStore.getState().discoveredEventIds;
}
