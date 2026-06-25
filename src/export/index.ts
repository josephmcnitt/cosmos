import type { CosmosVideoBrief } from './types';

export type {
  BriefDurationSec,
  BriefTone,
  BuildVideoBriefOptions,
  CosmosBriefMetadata,
  CosmosBriefSection,
  CosmosVideoBrief,
} from './types';

export { buildVideoBrief } from './buildVideoBrief';
export { buildCursorPrompt } from './cursorPrompt';

export function validateBrief(brief: CosmosVideoBrief): string[] {
  const warnings: string[] = [];
  if (brief.sections.length < 3) {
    warnings.push('Brief has fewer than 3 sections — video may be too short.');
  }
  if (brief.metadata.relatedEventIds.length === 0) {
    warnings.push('No cross-linked events — parallel threads section may be thin.');
  }
  const core = brief.sections.find((s) => s.heading === 'The mystery');
  if (!core && brief.sections.length <= 3) {
    warnings.push('No dedicated core/mystery section — body text may be missing.');
  }
  if (!brief.metadata.sourceUrl) {
    warnings.push('No sourceUrl on event — close section omits external citation.');
  }
  return warnings;
}

export function briefFilename(brief: CosmosVideoBrief): string {
  return `cosmos-${brief.metadata.eventId}-brief.json`;
}

export function downloadBrief(brief: CosmosVideoBrief): void {
  const json = JSON.stringify(brief, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = briefFilename(brief);
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyBriefPrompt(brief: CosmosVideoBrief): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(brief.openMontage.cursorPrompt);
    return true;
  } catch {
    return false;
  }
}
