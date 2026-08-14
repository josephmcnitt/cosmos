import { create } from 'zustand';

interface GematriaState {
  /** Puzzle id whose panel is open, or null. */
  openPuzzleId: string | null;
  /** Wrong-answer feedback line, if any. */
  feedback: string | null;
  /** Set once solved, so the panel can show the revelation before closing. */
  solved: boolean;
  openPuzzle: (puzzleId: string) => void;
  closePuzzle: () => void;
  setFeedback: (feedback: string | null) => void;
  markSolved: () => void;
}

export const useGematriaStore = create<GematriaState>((set) => ({
  openPuzzleId: null,
  feedback: null,
  solved: false,
  openPuzzle: (puzzleId) => set({ openPuzzleId: puzzleId, feedback: null, solved: false }),
  closePuzzle: () => set({ openPuzzleId: null, feedback: null, solved: false }),
  setFeedback: (feedback) => set({ feedback }),
  markSolved: () => set({ solved: true, feedback: null }),
}));
