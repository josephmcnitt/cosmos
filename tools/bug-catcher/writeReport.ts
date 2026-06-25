import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SessionAnalysis } from './buildAnalysis';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildHtmlReport(analysis: SessionAnalysis): string {
  const issueSections = analysis.issues
    .map((issue, index) => {
      const base = issue.relativeDir;
      const before = `${base}/before.png`;
      const after = `${base}/after.png`;
      const canvas = `${base}/canvas-after.png`;
      const hasCanvas = issue.artifacts.some((item) => item.name === 'canvas-after.png' && item.exists);
      const hud = issue.hudLines.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
      const actions = issue.activityTrail
        .slice(-16)
        .map((event) => `<li><code>${escapeHtml(`${event.at.slice(11, 19)} ${event.kind} · ${event.detail}`)}</code></li>`)
        .join('');
      const errors = [
        ...issue.errors.console.map((line) => `<li class="console">${escapeHtml(line)}</li>`),
        ...issue.errors.page.map((line) => `<li class="page">${escapeHtml(line)}</li>`),
        ...issue.errors.network.map((line) => `<li class="network">${escapeHtml(line)}</li>`),
      ].join('');

      return `
<section class="issue" id="${escapeHtml(issue.issue.id)}">
  <header>
    <h2>${index + 1}. ${escapeHtml(issue.issue.meta.note)}</h2>
    <p class="meta">${escapeHtml(issue.issue.meta.loggedAt)} · ${escapeHtml(issue.hudSummary)}${
      issue.imageDiff.available
        ? ` · ${issue.imageDiff.changedPercent.toFixed(1)}% visual delta`
        : ''
    }</p>
  </header>
  <div class="shots">
    <figure>
      <img src="${before}" alt="Before screenshot" loading="lazy" />
      <figcaption>Before</figcaption>
    </figure>
    <figure>
      <img src="${after}" alt="After screenshot" loading="lazy" />
      <figcaption>After</figcaption>
    </figure>
    ${
      hasCanvas
        ? `<figure>
      <img src="${canvas}" alt="Canvas screenshot" loading="lazy" />
      <figcaption>Canvas</figcaption>
    </figure>`
        : ''
    }
  </div>
  ${hud ? `<div class="panel"><h3>App state</h3><ul>${hud}</ul></div>` : ''}
  ${actions ? `<div class="panel"><h3>Actions leading up</h3><ul>${actions}</ul></div>` : ''}
  ${errors ? `<div class="panel"><h3>Errors</h3><ul>${errors}</ul></div>` : ''}
</section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bug session ${escapeHtml(analysis.session.id)}</title>
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; background: #0d1018; color: #edf1ff; }
    body { margin: 0 auto; max-width: 1200px; padding: 24px; }
    h1, h2, h3 { font-weight: 600; }
    .summary { opacity: 0.85; margin-bottom: 32px; }
    .issue { margin: 40px 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); }
    .meta { opacity: 0.75; font-size: 14px; }
    .shots { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 16px 0; }
    figure { margin: 0; }
    img { width: 100%; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: #000; }
    figcaption { font-size: 12px; opacity: 0.7; margin-top: 6px; }
    .panel { margin-top: 16px; padding: 12px 14px; border-radius: 10px; background: rgba(255,255,255,0.04); }
    ul { margin: 8px 0 0; padding-left: 18px; }
    li.console { color: #ffb4b4; }
    li.page { color: #ff8f8f; }
    li.network { color: #ffd27a; }
    nav a { color: #9eb6ff; }
    nav { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>Bug session analysis</h1>
  <p class="summary">
    ${escapeHtml(analysis.session.meta.startedAt)}${
      analysis.session.meta.endedAt ? ` → ${escapeHtml(analysis.session.meta.endedAt)}` : ''
    }
    · ${analysis.session.issues.length} issues${
      analysis.durationMinutes !== null ? ` · ${analysis.durationMinutes.toFixed(1)} min` : ''
    }
  </p>
  <nav>
    ${analysis.issues
      .map(
        (issue, index) =>
          `<a href="#${escapeHtml(issue.issue.id)}">${index + 1}. ${escapeHtml(issue.issue.meta.note.slice(0, 48))}${
            issue.issue.meta.note.length > 48 ? '…' : ''
          }</a>`,
      )
      .join('')}
  </nav>
  ${issueSections}
</body>
</html>`;
}

export function writeAnalysisOutputs(analysis: SessionAnalysis, markdown: string, agentPrompt: string): {
  analysisPath: string;
  agentPromptPath: string;
  htmlPath: string;
} {
  const sessionDir = analysis.session.dir;
  const analysisPath = join(sessionDir, 'ANALYSIS.md');
  const agentPromptPath = join(sessionDir, 'AGENT_PROMPT.md');
  const htmlPath = join(sessionDir, 'report.html');

  writeFileSync(analysisPath, markdown, 'utf8');
  writeFileSync(agentPromptPath, agentPrompt, 'utf8');
  writeFileSync(htmlPath, buildHtmlReport(analysis), 'utf8');

  return { analysisPath, agentPromptPath, htmlPath };
}
