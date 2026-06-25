import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { BugCatcherIssueMeta, BugCatcherSessionMeta } from './types';

export interface IssueRecord {
  id: string;
  dir: string;
  meta: BugCatcherIssueMeta;
}

export interface SessionRecord {
  id: string;
  dir: string;
  meta: BugCatcherSessionMeta;
  issues: IssueRecord[];
}

const ISSUE_ARTIFACTS = [
  'note.txt',
  'meta.json',
  'before.png',
  'after.png',
  'canvas-after.png',
  'page.html',
  'console.log',
  'page-errors.log',
  'network.log',
] as const;

export function defaultSessionsRoot(root: string): string {
  return join(root, 'bug-sessions');
}

export function isSessionDir(dir: string): boolean {
  return existsSync(join(dir, 'session.json'));
}

export function listSessions(sessionsRoot: string): SessionRecord[] {
  if (!existsSync(sessionsRoot)) return [];

  return readdirSync(sessionsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isSessionDir(join(sessionsRoot, entry.name)))
    .map((entry) => loadSession(join(sessionsRoot, entry.name)))
    .sort((a, b) => b.meta.startedAt.localeCompare(a.meta.startedAt));
}

export function resolveSessionPath(sessionsRoot: string, target?: string): SessionRecord {
  if (target) {
    const direct = target.includes('/') || target.includes('\\') ? target : join(sessionsRoot, target);
    if (!isSessionDir(direct)) {
      throw new Error(`Not a bug-catcher session: ${direct}`);
    }
    return loadSession(direct);
  }

  const sessions = listSessions(sessionsRoot);
  if (sessions.length === 0) {
    throw new Error(`No sessions found in ${sessionsRoot}`);
  }
  return sessions[0]!;
}

export function loadSession(dir: string): SessionRecord {
  const meta = JSON.parse(readFileSync(join(dir, 'session.json'), 'utf8')) as BugCatcherSessionMeta;
  const issues = readdirSync(join(dir, 'issues'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadIssue(join(dir, 'issues', entry.name)))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    id: dir.split(/[/\\]/).pop() ?? dir,
    dir,
    meta,
    issues,
  };
}

export function loadIssue(dir: string): IssueRecord {
  const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8')) as BugCatcherIssueMeta;
  return { id: meta.id, dir, meta };
}

export function readArtifact(dir: string, name: (typeof ISSUE_ARTIFACTS)[number]): string {
  const path = join(dir, name);
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8');
}

export function listArtifacts(issueDir: string): Array<{ name: string; path: string; exists: boolean; bytes: number }> {
  return ISSUE_ARTIFACTS.map((name) => {
    const path = join(issueDir, name);
    const exists = existsSync(path);
    return {
      name,
      path,
      exists,
      bytes: exists ? statSync(path).size : 0,
    };
  });
}

export function findIssue(session: SessionRecord, query: string): IssueRecord {
  const normalized = query.toLowerCase();
  const match =
    session.issues.find((issue) => issue.id === query) ??
    session.issues.find((issue) => issue.id.startsWith(normalized)) ??
    session.issues.find((issue) => issue.meta.note.toLowerCase().includes(normalized));

  if (!match) {
    throw new Error(`Issue not found: ${query}`);
  }
  return match;
}
