import { summarizeHudState } from '../bug-catcher/extractHudState';
import type { AgentSessionReport, ScenarioResult, StepRecord } from './types';

function renderStep(step: StepRecord): string[] {
  const lines: string[] = [];
  lines.push(`#### ${step.index}. ${step.name}${step.note ? ` — ${step.note}` : ''}`);
  if (step.probe) {
    lines.push(
      `- probe: mode=${step.probe.mode}, avatar=(${step.probe.avatarX}, ${step.probe.avatarZ}), yaw=${step.probe.avatarYaw}`,
    );
  }
  if (step.hud) lines.push(`- hud: ${summarizeHudState(step.hud)}`);
  if (step.save) {
    const s = step.save;
    const bits: string[] = [];
    if (s.currentWorldId) bits.push(`world=${s.currentWorldId}`);
    if (s.completedPuzzleIds?.length) bits.push(`puzzles=[${s.completedPuzzleIds.join(', ')}]`);
    if (s.discoveredEventIds?.length) bits.push(`discovered=${s.discoveredEventIds.length}`);
    if (s.sessionsCompleted) bits.push(`sessions=${s.sessionsCompleted}`);
    if (s.resonance && Object.keys(s.resonance).length) {
      bits.push(`resonance=${JSON.stringify(s.resonance)}`);
    }
    if (s.activePathId) bits.push(`path=${s.activePathId}`);
    if (bits.length) lines.push(`- save: ${bits.join(' · ')}`);
    if (s.ringRotations) lines.push(`- rings: ${JSON.stringify(s.ringRotations)}`);
  }
  for (const obs of step.observations) lines.push(`- 👁 ${obs}`);
  for (const problem of step.problems) lines.push(`- ⚠ **${problem}**`);
  if (step.consoleErrors.length) {
    lines.push(`- console errors (${step.consoleErrors.length}):`);
    for (const err of step.consoleErrors.slice(0, 5)) lines.push(`  - \`${err.slice(0, 200)}\``);
  }
  if (step.screenshot) lines.push(`- screenshot: \`${step.screenshot}\``);
  return lines;
}

function renderScenario(result: ScenarioResult): string[] {
  const lines: string[] = [];
  const badge = result.passed ? 'PASS' : 'FAIL';
  lines.push(`### ${result.scenario} — ${badge}`);
  if (result.error) lines.push(`- error: \`${result.error}\``);
  for (const step of result.steps) {
    lines.push(...renderStep(step), '');
  }
  return lines;
}

export function renderReport(report: AgentSessionReport): string {
  const failing = report.scenarios.filter((s) => !s.passed);
  const lines: string[] = [
    '# Agent playtest report',
    '',
    `- URL: ${report.url}`,
    `- Started: ${report.startedAt}`,
    `- Ended: ${report.endedAt}`,
    `- Scenarios: ${report.scenarios.length} (${failing.length} failing)`,
    '',
  ];
  if (failing.length) {
    lines.push('## Failures', '');
    for (const scenario of failing) {
      const problems = scenario.steps.flatMap((s) => s.problems);
      lines.push(`- **${scenario.scenario}**: ${scenario.error ?? problems.join(' · ') ?? 'see steps'}`);
    }
    lines.push('');
  }
  lines.push('## Scenarios', '');
  for (const scenario of report.scenarios) {
    lines.push(...renderScenario(scenario));
  }
  return lines.join('\n');
}
