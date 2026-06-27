import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  analyzeSession,
  buildSessionPrompt,
  formatSessionJson,
  formatSessionMarkdown,
} from './buildAnalysis';
import { defaultSessionsRoot, findIssue, listSessions, resolveSessionPath } from './loadSession';
import { writeAnalysisOutputs } from './writeReport';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

interface CliOptions {
  sessionsRoot: string;
  session?: string;
  issue?: string;
  list: boolean;
  write: boolean;
  html: boolean;
  open: boolean;
  json: boolean;
  prompt: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    sessionsRoot: defaultSessionsRoot(root),
    list: false,
    write: false,
    html: false,
    open: false,
    json: false,
    prompt: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--sessions' && argv[i + 1]) {
      options.sessionsRoot = argv[++i]!;
    } else if (arg === '--session' && argv[i + 1]) {
      options.session = argv[++i]!;
    } else if (arg === '--issue' && argv[i + 1]) {
      options.issue = argv[++i]!;
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg === '--write') {
      options.write = true;
    } else if (arg === '--html') {
      options.html = true;
    } else if (arg === '--open') {
      options.open = true;
      options.write = true;
      options.html = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--prompt') {
      options.prompt = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.open) {
    options.write = true;
    options.html = true;
  }

  return options;
}

function printHelp(): void {
  console.log(`Cosmos Bug Catcher — session analysis

Usage:
  bug-analyze [options]

Options:
  --list                 List recorded sessions
  --session <id|path>    Analyze a specific session (default: latest)
  --issue <id|text>      Focus on one issue for stdout prompt/json
  --write                Write ANALYSIS.md + AGENT_PROMPT.md to the session folder
  --html                 Also write report.html (visual review)
  --open                 Write outputs and open report.html in the browser
  --json                 Print structured JSON to stdout
  --prompt               Print agent prompt to stdout
  --sessions <dir>       Sessions root (default: ./bug-sessions)

Examples:
  bug-analyze.cmd
  bug-analyze.cmd --write --open
  bug-analyze.cmd --session 2026-06-25T19-40-09-455Z --issue 003
  bug-analyze.cmd --prompt --issue walk
`);
}

function openFile(path: string): void {
  if (process.platform === 'win32') {
    execFileSync('cmd', ['/c', 'start', '', path], { stdio: 'ignore' });
    return;
  }
  if (process.platform === 'darwin') {
    execFileSync('open', [path], { stdio: 'ignore' });
    return;
  }
  execFileSync('xdg-open', [path], { stdio: 'ignore' });
}

function printSessionList(sessionsRoot: string): void {
  const sessions = listSessions(sessionsRoot);
  if (sessions.length === 0) {
    console.log(`No sessions in ${sessionsRoot}`);
    return;
  }

  for (const session of sessions) {
    const ended = session.meta.endedAt ? 'complete' : 'in progress';
    const mode = session.meta.mode ?? 'qa';
    console.log(
      `${session.id} · ${mode} · ${session.issues.length} notes · ${ended} · ${session.meta.startedAt}`,
    );
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));

  if (options.list) {
    printSessionList(options.sessionsRoot);
    return;
  }

  const session = resolveSessionPath(options.sessionsRoot, options.session);
  const analysis = analyzeSession(session);

  if (options.issue) {
    findIssue(session, options.issue);
  }

  const markdown = formatSessionMarkdown(analysis);
  const sessionPrompt = buildSessionPrompt(analysis, options.issue);

  if (options.json) {
    if (options.issue) {
      const issue = findIssue(session, options.issue);
      const issueAnalysis = analysis.issues.find((item) => item.issue.id === issue.id);
      console.log(JSON.stringify(issueAnalysis, null, 2));
    } else {
      console.log(formatSessionJson(analysis));
    }
    return;
  }

  if (options.prompt) {
    console.log(sessionPrompt);
    return;
  }

  if (options.write || options.html) {
    const paths = writeAnalysisOutputs(analysis, markdown, sessionPrompt);
    console.log(`Wrote ${paths.analysisPath}`);
    console.log(`Wrote ${paths.promptPath}`);
    if (options.html) {
      console.log(`Wrote ${paths.htmlPath}`);
      if (options.open) openFile(paths.htmlPath);
    }
    return;
  }

  console.log(markdown);
}

main();
