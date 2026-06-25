import { join } from 'node:path';
import type { BugCatcherActivity } from './types';
import { extractHudState, formatHudState, summarizeHudState } from './extractHudState';
import { diffImages, isMeaningfulActivityKey } from './imageDiff';
import {
  listArtifacts,
  readArtifact,
  type IssueRecord,
  type SessionRecord,
} from './loadSession';

export interface IssueAnalysis {
  issue: IssueRecord;
  artifacts: ReturnType<typeof listArtifacts>;
  hud: ReturnType<typeof extractHudState>;
  hudLines: string[];
  hudSummary: string;
  errors: {
    console: string[];
    page: string[];
    network: string[];
  };
  activityTrail: BugCatcherActivity[];
  imageDiff: ReturnType<typeof diffImages>;
  relativeDir: string;
}

export interface SessionAnalysis {
  session: SessionRecord;
  durationMinutes: number | null;
  issues: IssueAnalysis[];
  sessionErrors: {
    console: number;
    page: number;
    network: number;
  };
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function filterActivity(events: BugCatcherActivity[]): BugCatcherActivity[] {
  return events.filter((event) => {
    if (event.kind === 'keydown' && !isMeaningfulActivityKey(event.detail)) return false;
    if (event.kind === 'click' && (event.detail === 'textarea' || event.detail === 'button')) return false;
    return true;
  });
}

function activityBetween(
  timeline: BugCatcherActivity[],
  startIso: string | null,
  endIso: string,
): BugCatcherActivity[] {
  const start = startIso ? Date.parse(startIso) : Number.NEGATIVE_INFINITY;
  const end = Date.parse(endIso);
  return filterActivity(
    timeline.filter((event) => {
      const t = Date.parse(event.at);
      return t > start && t <= end;
    }),
  );
}

function formatActivity(events: BugCatcherActivity[]): string[] {
  return events.map((event) => {
    const time = event.at.slice(11, 19);
    return `${time} ${event.kind} · ${event.detail}`;
  });
}

export function analyzeIssue(
  session: SessionRecord,
  issue: IssueRecord,
  previousLoggedAt: string | null,
): IssueAnalysis {
  const html = readArtifact(issue.dir, 'page.html');
  const hud = extractHudState(html);
  const relativeDir = join('issues', issue.id).replace(/\\/g, '/');

  return {
    issue,
    artifacts: listArtifacts(issue.dir),
    hud,
    hudLines: formatHudState(hud),
    hudSummary: summarizeHudState(hud),
    errors: {
      console: splitLines(readArtifact(issue.dir, 'console.log')),
      page: splitLines(readArtifact(issue.dir, 'page-errors.log')),
      network: splitLines(readArtifact(issue.dir, 'network.log')),
    },
    activityTrail: activityBetween(session.meta.timeline, previousLoggedAt, issue.meta.loggedAt),
    imageDiff: diffImages(join(issue.dir, 'before.png'), join(issue.dir, 'after.png')),
    relativeDir,
  };
}

export function analyzeSession(session: SessionRecord): SessionAnalysis {
  let previousLoggedAt: string | null = null;
  const issues = session.issues.map((issue) => {
    const analysis = analyzeIssue(session, issue, previousLoggedAt);
    previousLoggedAt = issue.meta.loggedAt;
    return analysis;
  });

  const started = Date.parse(session.meta.startedAt);
  const ended = session.meta.endedAt ? Date.parse(session.meta.endedAt) : NaN;
  const durationMinutes = Number.isFinite(ended) ? (ended - started) / 60_000 : null;

  const sessionErrors = issues.reduce(
    (acc, issue) => ({
      console: acc.console + issue.errors.console.length,
      page: acc.page + issue.errors.page.length,
      network: acc.network + issue.errors.network.length,
    }),
    { console: 0, page: 0, network: 0 },
  );

  return { session, durationMinutes, issues, sessionErrors };
}

export function formatIssueMarkdown(analysis: IssueAnalysis, index: number): string {
  const lines = [
    `## ${index + 1}. ${analysis.issue.meta.note}`,
    '',
    `- **ID:** \`${analysis.issue.id}\``,
    `- **Logged:** ${analysis.issue.meta.loggedAt}`,
    `- **URL:** ${analysis.issue.meta.url}`,
    `- **HUD:** ${analysis.hudSummary}`,
  ];

  if (analysis.imageDiff.available) {
    lines.push(
      `- **Visual change:** ${analysis.imageDiff.changedPercent.toFixed(1)}% of sampled pixels differ (before → after)`,
    );
  }

  if (analysis.hudLines.length > 0) {
    lines.push('', '**Captured app state**', '');
    for (const line of analysis.hudLines) {
      lines.push(`- ${line}`);
    }
  }

  const errorBlocks: Array<[string, string[]]> = [
    ['Console', analysis.errors.console],
    ['Page errors', analysis.errors.page],
    ['Network', analysis.errors.network],
  ];

  for (const [label, items] of errorBlocks) {
    if (items.length === 0) continue;
    lines.push('', `**${label}**`, '');
    for (const item of items) lines.push(`- ${item}`);
  }

  if (analysis.activityTrail.length > 0) {
    lines.push('', '**Actions leading up**', '');
    for (const line of formatActivity(analysis.activityTrail).slice(-16)) {
      lines.push(`- ${line}`);
    }
  }

  lines.push('', '**Artifacts**', '');
  for (const artifact of analysis.artifacts.filter((item) => item.exists)) {
    lines.push(`- \`${join(analysis.relativeDir, artifact.name).replace(/\\/g, '/')}\` (${artifact.bytes} bytes)`);
  }

  return lines.join('\n');
}

export function formatSessionMarkdown(analysis: SessionAnalysis): string {
  const { session, durationMinutes, sessionErrors } = analysis;
  const lines = [
    '# Bug session analysis',
    '',
    `- **Session:** \`${session.id}\``,
    `- **Folder:** \`${session.dir}\``,
    `- **Started:** ${session.meta.startedAt}`,
  ];

  if (session.meta.endedAt) lines.push(`- **Ended:** ${session.meta.endedAt}`);
  if (durationMinutes !== null) lines.push(`- **Duration:** ${durationMinutes.toFixed(1)} min`);
  lines.push(
    `- **Issues:** ${session.issues.length}`,
    `- **Errors captured:** console ${sessionErrors.console}, page ${sessionErrors.page}, network ${sessionErrors.network}`,
    '',
    '---',
    '',
  );

  analysis.issues.forEach((issue, index) => {
    lines.push(formatIssueMarkdown(issue, index), '', '---', '');
  });

  return lines.join('\n').trim() + '\n';
}

export function buildAgentPrompt(analysis: SessionAnalysis, issueId?: string): string {
  const selected = issueId
    ? analysis.issues.filter((item) => item.issue.id.startsWith(issueId) || item.issue.id.includes(issueId))
    : analysis.issues;

  if (selected.length === 0) {
    throw new Error(`No issues matched: ${issueId}`);
  }

  const lines = [
    'Review this Cosmos bug-catcher session and propose minimal, focused fixes.',
    '',
    `Session folder: ${analysis.session.dir}`,
    `Session started: ${analysis.session.meta.startedAt}`,
    `App URL: ${analysis.session.meta.startUrl}`,
    '',
    'For each issue below:',
    '1. Read the user note and the actions leading up to it.',
    '2. Inspect before/after screenshots and canvas captures in the issue folder.',
    '3. Use the captured HUD state to infer timeline, spatial scale, heaven phase, and walk mode.',
    '4. Identify likely source files and suggest a concrete fix.',
    '5. Note any console/page/network errors if relevant.',
    '',
    '---',
    '',
  ];

  selected.forEach((issue, index) => {
    lines.push(`### Issue ${index + 1}: ${issue.issue.meta.note}`);
    lines.push('');
    lines.push(`Folder: ${issue.issue.dir}`);
    lines.push(`HUD: ${issue.hudSummary}`);
    if (issue.hudLines.length > 0) {
      lines.push('State:');
      for (const line of issue.hudLines) lines.push(`- ${line}`);
    }
    if (issue.imageDiff.available) {
      lines.push(`Visual delta: ${issue.imageDiff.changedPercent.toFixed(1)}% pixels changed before→after`);
    }
    if (issue.errors.console.length > 0) {
      lines.push('Console:');
      for (const item of issue.errors.console) lines.push(`- ${item}`);
    }
    if (issue.errors.page.length > 0) {
      lines.push('Page errors:');
      for (const item of issue.errors.page) lines.push(`- ${item}`);
    }
    if (issue.activityTrail.length > 0) {
      lines.push('Recent actions:');
      for (const item of formatActivity(issue.activityTrail).slice(-12)) {
        lines.push(`- ${item}`);
      }
    }
    lines.push(
      'Artifacts:',
      `- ${join(issue.relativeDir, 'before.png').replace(/\\/g, '/')}`,
      `- ${join(issue.relativeDir, 'after.png').replace(/\\/g, '/')}`,
      `- ${join(issue.relativeDir, 'canvas-after.png').replace(/\\/g, '/')}`,
      `- ${join(issue.relativeDir, 'page.html').replace(/\\/g, '/')}`,
      '',
      '---',
      '',
    );
  });

  return lines.join('\n').trim() + '\n';
}

export function formatSessionJson(analysis: SessionAnalysis): string {
  return JSON.stringify(
    {
      sessionId: analysis.session.id,
      sessionDir: analysis.session.dir,
      startedAt: analysis.session.meta.startedAt,
      endedAt: analysis.session.meta.endedAt,
      issueCount: analysis.session.issues.length,
      durationMinutes: analysis.durationMinutes,
      sessionErrors: analysis.sessionErrors,
      issues: analysis.issues.map((issue) => ({
        id: issue.issue.id,
        note: issue.issue.meta.note,
        loggedAt: issue.issue.meta.loggedAt,
        url: issue.issue.meta.url,
        hudSummary: issue.hudSummary,
        hud: issue.hud,
        errors: issue.errors,
        imageDiff: issue.imageDiff,
        activityTrail: issue.activityTrail,
        artifacts: issue.artifacts.filter((item) => item.exists).map((item) => item.name),
        dir: issue.issue.dir,
      })),
    },
    null,
    2,
  );
}
