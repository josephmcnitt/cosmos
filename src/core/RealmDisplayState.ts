import { create } from 'zustand';

export interface RealmDisplayState {
  displayWeight: number;
  liminalWeight: number;
  spiritualWeight: number;
  embodimentOverlay: number;
  setDisplay: (
    partial: Partial<
      Pick<
        RealmDisplayState,
        'displayWeight' | 'liminalWeight' | 'spiritualWeight' | 'embodimentOverlay'
      >
    >,
  ) => void;
}

export const useRealmDisplayStore = create<RealmDisplayState>((set) => ({
  displayWeight: 0,
  liminalWeight: 0,
  spiritualWeight: 0,
  embodimentOverlay: 0,
  setDisplay: (partial) => set(partial),
}));
