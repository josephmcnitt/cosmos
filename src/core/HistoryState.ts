import { create } from 'zustand';
import type { DepthOfView, HistoryDomain, SpiritualTradition } from '../data/history/types';

export type HistoryTrack = 'material' | 'spiritual';

interface HistoryState {
  selectedEventId: string | null;
  selectedTrack: 'material' | 'spiritual' | null;
  historyTrack: HistoryTrack;
  domainFilter: HistoryDomain | 'all';
  traditionFilter: SpiritualTradition | 'all';
  depthOfView: DepthOfView;
  isFlying: boolean;
  selectEvent: (id: string | null, track?: 'material' | 'spiritual' | null) => void;
  setHistoryTrack: (track: HistoryTrack) => void;
  setDomainFilter: (domain: HistoryDomain | 'all') => void;
  setTraditionFilter: (tradition: SpiritualTradition | 'all') => void;
  setDepthOfView: (depth: DepthOfView) => void;
  setFlying: (flying: boolean) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  selectedEventId: null,
  selectedTrack: null,
  historyTrack: 'material',
  domainFilter: 'all',
  traditionFilter: 'all',
  depthOfView: 'exoteric',
  isFlying: false,

  selectEvent: (id, track = null) =>
    set({ selectedEventId: id, selectedTrack: id ? track : null }),

  setHistoryTrack: (track) => set({ historyTrack: track }),

  setDomainFilter: (domain) => set({ domainFilter: domain }),

  setTraditionFilter: (tradition) => set({ traditionFilter: tradition }),

  setDepthOfView: (depth) => set({ depthOfView: depth }),

  setFlying: (flying) => set({ isFlying: flying }),
}));
