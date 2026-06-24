import { create } from 'zustand';

export type IntroPhase = 'void' | 'ignition' | 'expansion' | 'reveal' | 'complete';

interface IntroState {
  phase: IntroPhase;
  startedAt: number | null;
  skipped: boolean;
  start: () => void;
  setPhase: (phase: IntroPhase) => void;
  skip: () => void;
  complete: () => void;
}

export const INTRO_VOID_MS = 2500;
export const INTRO_IGNITION_MS = 1500;
export const INTRO_EXPANSION_MS = 3500;
export const INTRO_REVEAL_MS = 2000;

export const useIntroStore = create<IntroState>((set) => ({
  phase: 'void',
  startedAt: null,
  skipped: false,

  start: () => set({ phase: 'void', startedAt: performance.now(), skipped: false }),

  setPhase: (phase) => set({ phase }),

  skip: () => set({ phase: 'complete', skipped: true }),

  complete: () => set({ phase: 'complete' }),
}));

export function introOverlayOpacity(phase: IntroPhase, elapsedMs: number): number {
  switch (phase) {
    case 'void':
      return 1;
    case 'ignition':
      return Math.max(0, 1 - elapsedMs / INTRO_IGNITION_MS);
    case 'expansion':
      return Math.max(0, 0.35 - (elapsedMs / INTRO_EXPANSION_MS) * 0.35);
    case 'reveal':
      return Math.max(0, 0.35 * (1 - elapsedMs / INTRO_REVEAL_MS));
    case 'complete':
      return 0;
    default:
      return 0;
  }
}
