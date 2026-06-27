export type SessionMode = 'qa' | 'guidance';

export type FeedbackKind = 'bug' | 'confused' | 'suggestion' | 'liked' | 'general';

export interface BugCatcherActivity {
  at: string;
  kind: 'click' | 'keydown' | 'navigate' | 'console' | 'pageerror';
  detail: string;
  url: string;
}

export interface BugCatcherIssueMeta {
  id: string;
  note: string;
  loggedAt: string;
  url: string;
  viewport: { width: number; height: number };
  recentActivity: BugCatcherActivity[];
  consoleSinceLastIssue: string[];
  pageErrorsSinceLastIssue: string[];
  networkSinceLastIssue: string[];
  feedbackKind?: FeedbackKind;
}

export interface BugCatcherSessionMeta {
  startedAt: string;
  endedAt?: string;
  startUrl: string;
  issueCount: number;
  timeline: BugCatcherActivity[];
  mode?: SessionMode;
  playerName?: string;
  wrapUp?: string;
  captureMode?: string;
}

export interface PanelConfig {
  mode: SessionMode;
  playerName?: string;
}

export const FEEDBACK_KIND_LABELS: Record<FeedbackKind, string> = {
  bug: 'Bug / broken',
  confused: 'Confused',
  suggestion: 'Suggestion',
  liked: 'Liked this',
  general: 'General note',
};

export const GUIDANCE_TIPS = [
  'Click anywhere or press a key to skip the opening.',
  'Mouse wheel — zoom from universe down to human scale.',
  'Bottom timeline — scrub through cosmic history (left = distant past, right = now).',
  'Shift + wheel — zoom the timeline for finer scrubbing.',
  'Zoom to human at the present era to enter walk mode (WASD to move).',
  'Near stones or objects: E to interact, Q (hold) to practice.',
  'Use Journal (top-right) to see what you have discovered.',
  'There is no wrong way to explore — note anything that confuses or delights you.',
];
