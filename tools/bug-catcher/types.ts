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
}

export interface BugCatcherSessionMeta {
  startedAt: string;
  endedAt?: string;
  startUrl: string;
  issueCount: number;
  timeline: BugCatcherActivity[];
}
