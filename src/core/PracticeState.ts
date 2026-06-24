import { create } from 'zustand';
import type { SpiritualTradition } from '../data/history/types';
import {
  clampResonance,
  computeSpiritualDepth,
  DISCOVERED_BONUS,
  dominantTradition,
  PRACTICE_DURATION_SEC,
  RESONANCE_GAIN,
  traditionForMarker,
} from './practice';

export type RealmPhase = 'material' | 'liminal' | 'spiritual';

export interface ActivePractice {
  tradition: SpiritualTradition;
  eventId: string;
  startedAt: number;
  progress: number;
}

interface PracticeState {
  resonance: Partial<Record<SpiritualTradition, number>>;
  spiritualDepth: number;
  dominantTradition: SpiritualTradition | null;
  realmPhase: RealmPhase;
  activePractice: ActivePractice | null;
  discoveredStones: string[];
  sustainElapsedSec: number;
  avatarMoving: boolean;
  nearbyEventId: string | null;

  markDiscovered: (eventId: string) => void;
  isDiscovered: (eventId: string) => boolean;
  setAvatarMoving: (moving: boolean) => void;
  setNearbyEventId: (eventId: string | null) => void;
  startPractice: (eventId: string) => boolean;
  tickPractice: (nowMs: number) => void;
  cancelPractice: () => void;
  completePractice: () => void;
  setResonance: (resonance: Partial<Record<SpiritualTradition, number>>) => void;
  setSpiritualDepth: (depth: number) => void;
  setRealmPhase: (phase: RealmPhase) => void;
  setSustainElapsed: (sec: number) => void;
  resetPractice: () => void;
}

const INITIAL: Pick<
  PracticeState,
  | 'resonance'
  | 'spiritualDepth'
  | 'dominantTradition'
  | 'realmPhase'
  | 'activePractice'
  | 'discoveredStones'
  | 'sustainElapsedSec'
  | 'avatarMoving'
  | 'nearbyEventId'
> = {
  resonance: {},
  spiritualDepth: 0,
  dominantTradition: null,
  realmPhase: 'material',
  activePractice: null,
  discoveredStones: [],
  sustainElapsedSec: 0,
  avatarMoving: false,
  nearbyEventId: null,
};

function syncDepth(state: Pick<PracticeState, 'resonance'>) {
  const depth = computeSpiritualDepth(state.resonance);
  return {
    spiritualDepth: depth,
    dominantTradition: dominantTradition(state.resonance),
  };
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  ...INITIAL,

  markDiscovered: (eventId) =>
    set((s) =>
      s.discoveredStones.includes(eventId)
        ? s
        : { discoveredStones: [...s.discoveredStones, eventId] },
    ),

  isDiscovered: (eventId) => get().discoveredStones.includes(eventId),

  setAvatarMoving: (moving) => set({ avatarMoving: moving }),

  setNearbyEventId: (eventId) => set({ nearbyEventId: eventId }),

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
    const { activePractice, resonance, discoveredStones } = get();
    if (!activePractice) return;

    let gain = RESONANCE_GAIN;
    if (discoveredStones.includes(activePractice.eventId)) {
      gain += DISCOVERED_BONUS;
    }

    const prev = resonance[activePractice.tradition] ?? 0;
    const nextResonance = {
      ...resonance,
      [activePractice.tradition]: clampResonance(prev + gain),
    };

    set({
      activePractice: null,
      resonance: nextResonance,
      ...syncDepth({ resonance: nextResonance }),
    });
  },

  setResonance: (resonance) =>
    set({ resonance, ...syncDepth({ resonance }) }),

  setSpiritualDepth: (depth) => set({ spiritualDepth: depth }),

  setRealmPhase: (phase) => set({ realmPhase: phase }),

  setSustainElapsed: (sec) => set({ sustainElapsedSec: sec }),

  resetPractice: () => set({ ...INITIAL }),
}));
