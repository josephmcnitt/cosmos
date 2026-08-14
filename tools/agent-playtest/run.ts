import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AgentDriver } from './driver';
import { renderReport } from './report';
import { SCENARIOS } from './scenarios';
import type { AgentSessionReport, ScenarioResult } from './types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

interface CliOptions {
  url?: string;
  scenarios: string[];
  headed: boolean;
  outRoot: string;
}

function parseArgs(argv: string[]): CliOptions {
  let url: string | undefined;
  let headed = false;
  let outRoot = join(root, 'bug-sessions');
  const scenarios: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--url' && argv[i + 1]) url = argv[++i]!;
    else if (arg === '--headed') headed = true;
    else if (arg === '--out' && argv[i + 1]) outRoot = argv[++i]!;
    else if (arg === '--scenario' && argv[i + 1]) scenarios.push(...argv[++i]!.split(','));
    else if (arg === '--all') scenarios.push(...Object.keys(SCENARIOS));
    else if (arg === '--list') {
      console.log(Object.keys(SCENARIOS).join('\n'));
      process.exit(0);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  if (scenarios.length === 0) scenarios.push(...Object.keys(SCENARIOS));
  return { url, scenarios: [...new Set(scenarios)], headed, outRoot };
}

function printHelp(): void {
  console.log(`Cosmos agent playtest — autonomous scripted playthroughs with structured captures

Usage:
  agent-playtest.cmd [options]

Options:
  --scenario a,b   Run specific scenarios (default: all). --list to enumerate.
  --all            Run every scenario.
  --url <url>      App URL. Default: reuse 5173/4173 if up, else start vite preview.
  --headed         Show the browser window.
  --out <dir>      Output root (default: ./bug-sessions)

Output: bug-sessions/agent-<timestamp>/ with REPORT.md, report.json, screenshots.`);
}

async function urlUp(url: string, timeoutMs = 1500): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return false;
}

/** Reuse a running dev/preview server, else start `vite preview` (needs dist/). */
async function resolveServer(
  requested?: string,
): Promise<{ url: string; proc: ChildProcess | null }> {
  if (requested) {
    if (!(await urlUp(requested, 3000))) throw new Error(`Cannot reach ${requested}`);
    return { url: requested, proc: null };
  }
  for (const candidate of ['http://127.0.0.1:5173', 'http://127.0.0.1:4173']) {
    if (await urlUp(candidate)) return { url: candidate, proc: null };
  }
  console.log('No app server found — starting vite preview (requires a prior build)…');
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const proc = spawn(npx, ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: root,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });
  const url = 'http://127.0.0.1:4173';
  if (!(await urlUp(url, 20_000))) {
    proc.kill();
    throw new Error('vite preview did not come up on 4173 — run a build first (npm run build)');
  }
  return { url, proc };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const { url, proc } = await resolveServer(options.url);
  const sessionDir = join(
    options.outRoot,
    `agent-${new Date().toISOString().replace(/[:.]/g, '-')}`,
  );
  mkdirSync(sessionDir, { recursive: true });

  const report: AgentSessionReport = {
    startedAt: new Date().toISOString(),
    endedAt: '',
    url,
    scenarios: [],
  };

  for (const name of options.scenarios) {
    const scenario = SCENARIOS[name];
    if (!scenario) {
      console.error(`Unknown scenario: ${name} (use --list)`);
      continue;
    }
    console.log(`▶ ${name}`);
    const driver = new AgentDriver({ url, headed: options.headed, outDir: sessionDir });
    const result: ScenarioResult = {
      scenario: name,
      startedAt: new Date().toISOString(),
      endedAt: '',
      passed: false,
      steps: driver.steps,
    };
    try {
      await driver.launch();
      await scenario(driver);
      result.passed = driver.steps.every((s) => s.problems.length === 0);
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      result.passed = false;
    } finally {
      result.endedAt = new Date().toISOString();
      await driver.close().catch(() => undefined);
    }
    report.scenarios.push(result);
    const problems = result.steps.flatMap((s) => s.problems);
    console.log(
      `  ${result.passed ? 'PASS' : 'FAIL'}${result.error ? ` — ${result.error}` : ''}${problems.length ? ` — ${problems.length} problem(s)` : ''}`,
    );
  }

  report.endedAt = new Date().toISOString();
  writeFileSync(join(sessionDir, 'report.json'), JSON.stringify(report, null, 2));
  writeFileSync(join(sessionDir, 'REPORT.md'), renderReport(report));
  console.log(`\nSession: ${sessionDir}`);
  console.log(`Report:  ${join(sessionDir, 'REPORT.md')}`);

  proc?.kill();
  const failed = report.scenarios.some((s) => !s.passed);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
