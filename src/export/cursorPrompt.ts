import type { CosmosVideoBrief } from './types';

export function buildCursorPrompt(brief: CosmosVideoBrief): string {
  const briefFilename = `cosmos-${brief.metadata.eventId}-brief.json`;
  return [
    `Using the OpenMontage Animated Explainer pipeline, produce a ${brief.durationTargetSec}-second video from the attached Cosmos brief.`,
    '',
    'Requirements:',
    '- Use Piper TTS for narration (free/local path unless I provide other API keys).',
    '- Use Remotion image scenes with Ken Burns motion — contemplative pacing.',
    `- Tone: ${brief.tone}. Style playbook: ${brief.openMontage.stylePlaybook}.`,
    brief.traditionColor
      ? `- Accent color for titles and transitions: ${brief.traditionColor}.`
      : '- Use clean professional palette.',
    `- Follow the ${brief.sections.length} sections in the brief (hook → context → core → links → close).`,
    '- Honor onScreenText and visualHint fields for each section.',
    '',
    `Brief file: exports/${briefFilename}`,
    `Topic: ${brief.topic}`,
    '',
    'Research the topic briefly for factual accuracy, then render the final MP4.',
  ].join('\n');
}
