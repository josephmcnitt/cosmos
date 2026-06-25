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
import { BUG_CATCHER_PANEL_SCRIPT } from './panelScript';
import type { BugCatcherActivity, BugCatcherIssueMeta, BugCatcherSessionMeta } from './types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

interface CliOptions {
  url: string;
  outDir: string;
  serve: 'none' | 'dev' | 'preview';
}

function parseArgs(argv: string[]): CliOptions {
  let url = process.env.COSMOS_BUG_CATCH_URL ?? 'http://127.0.0.1:5173';
  let outDir = join(root, 'bug-sessions');
  let serve: CliOptions['serve'] = 'none';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--url' && argv[i + 1]) {
      url = argv[++i]!;
    } else if (arg === '--out' && argv[i + 1]) {
      outDir = argv[++i]!;
    } else if (arg === '--serve' && argv[i + 1]) {
      const mode = argv[++i]!;
      if (mode === 'dev' || mode === 'preview' || mode === 'none') serve = mode;
      else throw new Error(`Unknown --serve value: ${mode}`);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return { url, outDir, serve };
}

function printHelp(): void {
  console.log(`Cosmos Bug Catcher — manual QA session recorder

Usage:
  npm run bug-catch [-- options]

Options:
  --url <url>       App URL (default: http://127.0.0.1:5173)
  --out <dir>       Session output root (default: ./bug-sessions)
  --serve dev       Start "npm run dev" if URL is unreachable
  --serve preview   Start "npm run preview" on 127.0.0.1:4173
  --serve none      Do not start a server (default)

While the browser is open:
  • Drag the panel by its header to move it out of the way
  • Type issues in the text box; click Log issue or Ctrl+Enter
  • Each issue saves before/after screenshots, HTML, console logs, and recent activity
  • Click End session (or close the browser) to write the session report
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
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status < 500) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
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
  readonly timeline: BugCatcherActivity[] = [];
  readonly startedAt = isoNow();
  issueCount = 0;
  beforeScreenshot: Buffer | null = null;
  consoleBuffer: string[] = [];
  pageErrorBuffer: string[] = [];
  consoleSinceLastIssue: string[] = [];
  pageErrorsSinceLastIssue: string[] = [];
  networkSinceLastIssue: string[] = [];
  screenshotTimer: ReturnType<typeof setInterval> | null = null;
  ending = false;

  constructor(outRoot: string) {
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
    };
    writeFileSync(join(this.dir, 'session.json'), JSON.stringify(meta, null, 2));
  }

  writeReport(startUrl: string): void {
    const lines = [
      '# Bug Catcher session',
      '',
      `- Started: ${this.startedAt}`,
      `- URL: ${startUrl}`,
      `- Issues: ${this.issueCount}`,
      `- Folder: ${this.dir}`,
      '',
    ];

    if (this.issueCount === 0) {
      lines.push('_No issues logged._');
    } else {
      lines.push('## Issues', '');
      const folders = readdirSync(this.issuesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();
      for (const folder of folders) {
        const metaPath = join(this.issuesDir, folder, 'meta.json');
        if (!existsSync(metaPath)) continue;
        const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as BugCatcherIssueMeta;
        lines.push(`### ${meta.id}`, '', meta.note, '', `- URL: ${meta.url}`, `- Logged: ${meta.loggedAt}`, '');
      }
    }

    writeFileSync(join(this.dir, 'REPORT.md'), lines.join('\n'));
  }
}

async function captureCanvasIfPresent(page: Page, path: string): Promise<boolean> {
  const canvas = page.locator('.canvas canvas');
  if (!(await canvas.count())) return false;
  try {
    await canvas.first().waitFor({ state: 'visible', timeout: 2000 });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          let remaining = 4;
          const step = () => {
            remaining -= 1;
            if (remaining <= 0) resolve();
            else requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }),
    );
    await canvas.first().screenshot({ path });
    return true;
  } catch {
    return false;
  }
}

async function saveIssue(page: Page, session: BugCatcherSession, note: string): Promise<void> {
  session.issueCount += 1;
  const id = `${String(session.issueCount).padStart(3, '0')}-${slugify(note)}`;
  const issueDir = join(session.issuesDir, id);
  mkdirSync(issueDir, { recursive: true });

  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  const before = session.beforeScreenshot;
  if (before) {
    writeFileSync(join(issueDir, 'before.png'), before);
  }

  await page.screenshot({ path: join(issueDir, 'after.png'), fullPage: true });
  await captureCanvasIfPresent(page, join(issueDir, 'canvas-after.png'));

  const html = await page.content();
  writeFileSync(join(issueDir, 'page.html'), html, 'utf8');

  writeFileSync(join(issueDir, 'note.txt'), note, 'utf8');
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
  };
  writeFileSync(join(issueDir, 'meta.json'), JSON.stringify(meta, null, 2));

  session.consoleSinceLastIssue = [];
  session.pageErrorsSinceLastIssue = [];
  session.networkSinceLastIssue = [];
  session.beforeScreenshot = await page.screenshot({ fullPage: false });

  await page.evaluate((count) => {
    window.__bugCatcherIssueLogged?.();
    window.__bugCatcherSetStatus?.(`Saved issue #${count} · watching…`);
  }, session.issueCount);

  console.log(`Saved issue #${session.issueCount}: ${issueDir}`);
}

async function runSession(options: CliOptions): Promise<void> {
  let serverProc: ChildProcess | null = null;

  if (options.serve !== 'none') {
    const ready = await waitForUrl(options.url, 1500);
    if (!ready) {
      serverProc = startServer(options.serve);
      const ok = await waitForUrl(options.url, 120_000);
      if (!ok) {
        serverProc.kill();
        throw new Error(`Timed out waiting for ${options.url}`);
      }
    }
  }

  const session = new BugCatcherSession(options.outDir);
  console.log(`Session folder: ${session.dir}`);
  console.log(`Opening ${options.url}`);
  console.log('Use the floating panel to log issues. End session when done.\n');

  let browser: Browser | null = null;
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
    });

    await page.exposeFunction('__bugCatcherLogIssue', async (note: string) => {
      await saveIssue(page, session, note);
    });

    await page.exposeFunction('__bugCatcherEndSession', async () => {
      if (session.ending) return;
      session.ending = true;
      resolveEnd?.();
    });

    await page.addInitScript(BUG_CATCHER_PANEL_SCRIPT);

    await page.goto(options.url, { waitUntil: 'domcontentloaded' });
    session.flushSessionMeta(options.url);
    session.beforeScreenshot = await page.screenshot({ fullPage: false });

    session.screenshotTimer = setInterval(async () => {
      try {
        session.beforeScreenshot = await page.screenshot({ fullPage: false });
      } catch {
        // page may be closing
      }
    }, 2500);

    await page.evaluate(() => {
      window.__bugCatcherSetStatus?.('Watching · 0 issues');
    });

    page.on('close', () => {
      if (!session.ending) resolveEnd?.();
    });

    await ended;
  } finally {
    if (session.screenshotTimer) clearInterval(session.screenshotTimer);
    session.flushSessionMeta(options.url, true);
    session.writeReport(options.url);
    if (browser) await browser.close().catch(() => undefined);
    if (serverProc) serverProc.kill();
    console.log(`\nSession saved to ${session.dir}`);
    console.log(`Report: ${join(session.dir, 'REPORT.md')}`);
  }
}

declare global {
  interface Window {
    __bugCatcherInstalled?: boolean;
    __bugCatcherLogIssue?: (note: string) => Promise<void>;
    __bugCatcherEndSession?: () => Promise<void>;
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
