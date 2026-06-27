export type InitiationStep =
  | { type: 'dialogue'; text: string; speaker?: string }
  | {
      type: 'choose';
      text: string;
      options: { id: string; label: string; correct?: boolean }[];
    }
  | { type: 'walk-to'; text: string; targetX: number; targetZ: number; radius?: number }
  | { type: 'hold-still'; text: string; durationSec: number }
  | { type: 'face-direction'; text: string; targetYaw: number; tolerance?: number }
  | { type: 'silence'; text: string; durationSec: number };

export interface InitiationDefinition {
  id: string;
  worldId: string;
  title: string;
  steps: InitiationStep[];
  completionJournal: { title: string; body: string };
}

export type InitiationStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface ActiveInitiation {
  initiationId: string;
  stepIndex: number;
  stepStartedAt: number;
  choiceId?: string;
}
