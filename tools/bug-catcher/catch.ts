import { spawn, type ChildProcess } from 'node:child_process';
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from '@playwright/test';
import { buildPanelScript } from './panelScript';
import {
  captureCanvasOrViewport,
  captureCanvasToFile,
  defaultCaptureMode,
  RollingCapture,
  type CaptureMode,
} from './rollingCapture';
import type {
  BugCatcherActivity,
  BugCatcherIssueMeta,
  BugCatcherSessionMeta,
  FeedbackKind,
  PanelConfig,
  SessionMode,
} from './types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

interface CliOptions {
  url: string;
  outDir: string;
  /** `auto` = start dev/preview when localhost URL is down (default) */
  serve: 'auto' | 'none' | 'dev' | 'preview';
  mode: SessionMode;
  playerName?: string;
  capture: CaptureMode;
}

function inferLocalServe(url: string): 'dev' | 'preview' | null {
  try {
    const u = new URL(url);
    const local = u.hostname === '127.0.0.1' || u.hostname === 'localhost';
    if (!local) return null;
    const port = u.port || (u.protocol === 'https:' ? '443' : '80');
    if (port === '5173') return 'dev';
    if (port === '4173') return 'preview';
  } catch {
    // ignore
  }
  return null;
}

function parseArgs(argv: string[]): CliOptions {
  let url = process.env.COSMOS_BUG_CATCH_URL ?? 'http://127.0.0.1:5173';
  let outDir = join(root, 'bug-sessions');
  let serve: CliOptions['serve'] = 'auto';
  let mode: SessionMode =
    process.env.COSMOS_BUG_CATCH_MODE === 'guidance' ? 'guidance' : 'qa';
  let playerName = process.env.COSMOS_BUG_CATCH_PLAYER;
  let capture: CaptureMode | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--url' && argv[i + 1]) {
      url = argv[++i]!;
    } else if (arg === '--out' && argv[i + 1]) {
      outDir = argv[++i]!;
    } else if (arg === '--serve' && argv[i + 1]) {
      const serveMode = argv[++i]!;
      if (serveMode === 'auto' || serveMode === 'dev' || serveMode === 'preview' || serveMode === 'none') {
        serve = serveMode;
      } else throw new Error(`Unknown --serve value: ${serveMode}`);
    } else if (arg === '--mode' && argv[i + 1]) {
      const parsed = argv[++i]!;
      if (parsed === 'qa' || parsed === 'guidance') mode = parsed;
      else throw new Error(`Unknown --mode value: ${parsed}`);
    } else if (arg === '--player' && argv[i + 1]) {
      playerName = argv[++i]!;
    } else if (arg === '--capture' && argv[i + 1]) {
      const parsed = argv[++i]!;
      if (parsed === 'debounced' || parsed === 'on-log' || parsed === 'interval') capture = parsed;
      else throw new Error(`Unknown --capture value: ${parsed}`);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return {
    url,
    outDir,
    serve,
    mode,
    playerName,
    capture: capture ?? defaultCaptureMode(mode),
  };
}

function printHelp(): void {
  console.log(`Cosmos Bug Catcher — manual QA / playtest session recorder

Usage:
  bug-catch.cmd [options]
  playtest.cmd [options]          # same as --mode guidance

Options:
  --mode qa|guidance  qa = bug-focused (default); guidance = new-player playtest
  --player <name>     Optional playtester name (guidance mode)
  --capture <mode>    on-log | debounced | interval (default: on-log — no HUD blink)
                      debounced = canvas capture after app clicks; interval = legacy (avoid)
  --serve auto|dev|preview|none
                      auto = start dev/preview if localhost is down (default)
  --url <url>         App URL (default: http://127.0.0.1:5173)
  --out <dir>         Session output root (default: ./bug-sessions)

QA mode:
  • Log bugs/issues with Ctrl+Enter

Guidance mode (for new players):
  • Friendly panel with quick guide and note categories
  • Categories: confused, bug, suggestion, liked, general
  • Optional wrap-up when finishing the session
  • Same screenshots/artifacts captured for each note

Environment:
  COSMOS_BUG_CATCH_MODE=guidance
  COSMOS_BUG_CATCH_PLAYER=Alice
`);
}

function slugify(text: string, max = 48): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max);
  return slug || 'issue';
}

function isoNow(): string {
  return new Date().toISOString();
}

function sessionDirName(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function waitForUrl(url: string, timeoutMs = 15_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const method of ['GET', 'HEAD'] as const) {
      try {
        const res = await fetch(url, { method });
        if (res.ok || res.status < 500) return true;
      } catch {
        // retry
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function ensureAppServer(options: CliOptions): Promise<ChildProcess | null> {
  if (await waitForUrl(options.url, 1500)) return null;

  let serve = options.serve;
  if (serve === 'auto') {
    const inferred = inferLocalServe(options.url);
    if (inferred) {
      serve = inferred;
    } else {
      serve = 'none';
    }
  }

  if (serve === 'none') {
    throw new Error(
      [
        `Cannot reach ${options.url}.`,
        'Start the app in another terminal: .\\dev.cmd',
        'Or run: .\\bug-catch.cmd -- --serve dev',
      ].join('\n'),
    );
  }

  console.log(`App not running — starting ${serve} server (this may take a moment)…`);
  const proc = startServer(serve);
  const ok = await waitForUrl(options.url, 120_000);
  if (!ok) {
    proc.kill();
    throw new Error(`Timed out waiting for ${options.url} after starting ${serve}`);
  }
  console.log(`App ready at ${options.url}\n`);
  return proc;
}

function startServer(mode: 'dev' | 'preview'): ChildProcess {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args =
    mode === 'dev'
      ? ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173']
      : ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'];
  console.log(`Starting ${mode} server…`);
  return spawn(npm, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}

class BugCatcherSession {
  readonly dir: string;
  readonly issuesDir: string;
  readonly mode: SessionMode;
  readonly captureMode: CaptureMode;
  readonly playerName?: string;
  readonly timeline: BugCatcherActivity[] = [];
  readonly startedAt = isoNow();
  issueCount = 0;
  wrapUp?: string;
  consoleBuffer: string[] = [];
  pageErrorBuffer: string[] = [];
  consoleSinceLastIssue: string[] = [];
  pageErrorsSinceLastIssue: string[] = [];
  networkSinceLastIssue: string[] = [];
  ending = false;

  constructor(outRoot: string, mode: SessionMode, captureMode: CaptureMode, playerName?: string) {
    this.mode = mode;
    this.captureMode = captureMode;
    this.playerName = playerName;
    this.dir = join(outRoot, sessionDirName());
    this.issuesDir = join(this.dir, 'issues');
    mkdirSync(this.issuesDir, { recursive: true });
    writeFileSync(
      join(this.dir, 'session.json'),
      JSON.stringify(
        {
          startedAt: this.startedAt,
          startUrl: '',
          issueCount: 0,
          timeline: [],
          mode,
          captureMode,
          playerName,
        } satisfies BugCatcherSessionMeta,
        null,
        2,
      ),
    );
  }

  pushActivity(raw: { kind: BugCatcherActivity['kind']; detail: string; url: string; t: number }): void {
    const entry: BugCatcherActivity = {
      at: new Date(raw.t).toISOString(),
      kind: raw.kind,
      detail: raw.detail,
      url: raw.url,
    };
    this.timeline.push(entry);
    if (this.timeline.length > 500) this.timeline.shift();
  }

  recentActivity(limit = 12): BugCatcherActivity[] {
    return this.timeline.slice(-limit);
  }

  flushSessionMeta(startUrl: string, ended = false): void {
    const meta: BugCatcherSessionMeta = {
      startedAt: this.startedAt,
      endedAt: ended ? isoNow() : undefined,
      startUrl,
      issueCount: this.issueCount,
      timeline: this.timeline,
      mode: this.mode,
      playerName: this.playerName,
      wrapUp: this.wrapUp,
      captureMode: this.captureMode,
    };
    writeFileSync(join(this.dir, 'session.json'), JSON.stringify(meta, null, 2));
  }

  writeReport(startUrl: string): void {
    const isGuidance = this.mode === 'guidance';
    const lines = [
      isGuidance ? '# Playtest session' : '# Bug Catcher session',
      '',
      `- Started: ${this.startedAt}`,
      `- URL: ${startUrl}`,
      `- Mode: ${this.mode}`,
    ];
    if (this.playerName) lines.push(`- Player: ${this.playerName}`);
    lines.push(`- Notes: ${this.issueCount}`, `- Folder: ${this.dir}`, '');

    if (this.wrapUp) {
      lines.push('## Overall wrap-up', '', this.wrapUp, '');
    }

    if (this.issueCount === 0) {
      lines.push(isGuidance ? '_No notes saved._' : '_No issues logged._');
    } else {
      lines.push(isGuidance ? '## Notes' : '## Issues', '');
      const folders = readdirSync(this.issuesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();
      for (const folder of folders) {
        const metaPath = join(this.issuesDir, folder, 'meta.json');
        if (!existsSync(metaPath)) continue;
        const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as BugCatcherIssueMeta;
        const kind = meta.feedbackKind ? ` [${meta.feedbackKind}]` : '';
        lines.push(`### ${meta.id}${kind}`, '', meta.note, '', `- URL: ${meta.url}`, `- Logged: ${meta.loggedAt}`, '');
      }
    }

    writeFileSync(join(this.dir, 'REPORT.md'), lines.join('\n'));
  }
}

interface LogIssuePayload {
  note: string;
  feedbackKind?: FeedbackKind;
}

async function saveIssue(
  page: Page,
  session: BugCatcherSession,
  rolling: RollingCapture,
  payload: string | LogIssuePayload,
): Promise<void> {
  const note = typeof payload === 'string' ? payload : payload.note;
  const feedbackKind = typeof payload === 'string' ? undefined : payload.feedbackKind;

  await rolling.ensureBeforeBuffer();
  const before = rolling.buffer;

  session.issueCount += 1;
  const id = `${String(session.issueCount).padStart(3, '0')}-${slugify(note)}`;
  const issueDir = join(session.issuesDir, id);
  mkdirSync(issueDir, { recursive: true });

  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  if (before) {
    writeFileSync(join(issueDir, 'before.png'), before);
  }

  const afterShot = await captureCanvasOrViewport(page);
  writeFileSync(join(issueDir, 'after.png'), afterShot);
  await captureCanvasToFile(page, join(issueDir, 'canvas-after.png'));

  const html = await page.content();
  writeFileSync(join(issueDir, 'page.html'), html, 'utf8');

  writeFileSync(join(issueDir, 'note.txt'), note, 'utf8');
  if (feedbackKind) {
    writeFileSync(join(issueDir, 'feedback-kind.txt'), feedbackKind, 'utf8');
  }
  writeFileSync(join(issueDir, 'console.log'), session.consoleSinceLastIssue.join('\n'), 'utf8');
  writeFileSync(
    join(issueDir, 'page-errors.log'),
    session.pageErrorsSinceLastIssue.join('\n'),
    'utf8',
  );
  writeFileSync(
    join(issueDir, 'network.log'),
    session.networkSinceLastIssue.join('\n'),
    'utf8',
  );

  const meta: BugCatcherIssueMeta = {
    id,
    note,
    loggedAt: isoNow(),
    url: page.url(),
    viewport,
    recentActivity: session.recentActivity(),
    consoleSinceLastIssue: [...session.consoleSinceLastIssue],
    pageErrorsSinceLastIssue: [...session.pageErrorsSinceLastIssue],
    networkSinceLastIssue: [...session.networkSinceLastIssue],
    feedbackKind,
  };
  writeFileSync(join(issueDir, 'meta.json'), JSON.stringify(meta, null, 2));

  session.consoleSinceLastIssue = [];
  session.pageErrorsSinceLastIssue = [];
  session.networkSinceLastIssue = [];
  rolling.buffer = afterShot;

  await page.evaluate(({ count, isGuidance }) => {
    window.__bugCatcherIssueLogged?.();
    window.__bugCatcherSetStatus?.(
      isGuidance ? `${count} note${count === 1 ? '' : 's'} saved` : `Saved issue #${count} · watching…`,
    );
  }, { count: session.issueCount, isGuidance: session.mode === 'guidance' });

  const label = session.mode === 'guidance' ? 'Note' : 'Issue';
  console.log(`Saved ${label} #${session.issueCount}: ${issueDir}`);
}

async function runSession(options: CliOptions): Promise<void> {
  const serverProc = await ensureAppServer(options);

  const session = new BugCatcherSession(options.outDir, options.mode, options.capture, options.playerName);
  const panelConfig: PanelConfig = { mode: options.mode, playerName: options.playerName };
  console.log(`Session folder: ${session.dir}`);
  console.log(
    `Mode: ${options.mode} · capture: ${options.capture}${options.playerName ? ` · player: ${options.playerName}` : ''}`,
  );
  console.log(`Opening ${options.url}`);
  console.log(
    options.mode === 'guidance'
      ? 'Share the quick guide with your player. Save notes as they explore.\n'
      : 'Use the floating panel to log issues. End session when done.\n',
  );

  let browser: Browser | null = null;
  let rolling: RollingCapture | null = null;
  let navigated = false;
  let resolveEnd: (() => void) | null = null;
  const ended = new Promise<void>((resolve) => {
    resolveEnd = resolve;
  });

  try {
    browser = await chromium.launch({
      headless: false,
      args: ['--use-gl=angle', '--ignore-gpu-blocklist'],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    rolling = new RollingCapture(page, { mode: options.capture });

    page.on('console', (msg) => {
      const line = `[${msg.type()}] ${msg.text()}`;
      session.consoleBuffer.push(line);
      session.consoleSinceLastIssue.push(line);
      if (session.consoleBuffer.length > 400) session.consoleBuffer.shift();
      if (msg.type() === 'error') {
        session.pushActivity({
          kind: 'console',
          detail: msg.text(),
          url: page.url(),
          t: Date.now(),
        });
      }
    });

    page.on('pageerror', (err) => {
      const line = err.message;
      session.pageErrorBuffer.push(line);
      session.pageErrorsSinceLastIssue.push(line);
      session.pushActivity({
        kind: 'pageerror',
        detail: line,
        url: page.url(),
        t: Date.now(),
      });
    });

    page.on('requestfailed', (req) => {
      const line = `[failed] ${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'unknown'}`;
      session.networkSinceLastIssue.push(line);
    });

    page.on('response', (res) => {
      if (res.status() < 400) return;
      const line = `[${res.status()}] ${res.request().method()} ${res.url()}`;
      session.networkSinceLastIssue.push(line);
    });

    page.on('framenavigated', (frame) => {
      if (frame !== page.mainFrame()) return;
      session.pushActivity({
        kind: 'navigate',
        detail: frame.url(),
        url: frame.url(),
        t: Date.now(),
      });
    });

    await page.exposeFunction('__bugCatcherActivity', (raw: {
      kind: BugCatcherActivity['kind'];
      detail: string;
      url: string;
      t: number;
    }) => {
      session.pushActivity(raw);
      rolling.onActivity();
    });

    await page.exposeFunction('__bugCatcherLogIssue', async (payload: string | LogIssuePayload) => {
      await saveIssue(page, session, rolling, payload);
    });

    await page.exposeFunction('__bugCatcherEndSession', async (wrapUp?: string) => {
      if (session.ending) return;
      if (wrapUp?.trim()) {
        session.wrapUp = wrapUp.trim();
        writeFileSync(join(session.dir, 'wrap-up.txt'), session.wrapUp, 'utf8');
      }
      session.ending = true;
      resolveEnd?.();
    });

    await page.addInitScript(buildPanelScript(panelConfig));

    await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    navigated = true;
    session.flushSessionMeta(options.url);
    rolling.start();
    await rolling.captureNow();

    await page.evaluate(({ isGuidance }) => {
      window.__bugCatcherSetStatus?.(
        isGuidance ? '0 notes saved · explore and jot thoughts' : 'Watching · 0 issues',
      );
    }, { isGuidance: options.mode === 'guidance' });

    page.on('close', () => {
      if (!session.ending) resolveEnd?.();
    });

    await ended;
  } finally {
    rolling?.stop();
    if (navigated) {
      session.flushSessionMeta(options.url, true);
      session.writeReport(options.url);
      console.log(`\nSession saved to ${session.dir}`);
      console.log(`Report: ${join(session.dir, 'REPORT.md')}`);
    }
    if (browser) await browser.close().catch(() => undefined);
    if (serverProc) serverProc.kill();
  }
}

declare global {
  interface Window {
    __bugCatcherInstalled?: boolean;
    __bugCatcherLogIssue?: (payload: string | LogIssuePayload) => Promise<void>;
    __bugCatcherEndSession?: (wrapUp?: string) => Promise<void>;
    __bugCatcherActivity?: (raw: {
      kind: BugCatcherActivity['kind'];
      detail: string;
      url: string;
      t: number;
    }) => void;
    __bugCatcherSetStatus?: (text: string) => void;
    __bugCatcherIssueLogged?: () => void;
  }
}

const options = parseArgs(process.argv.slice(2));
runSession(options).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
