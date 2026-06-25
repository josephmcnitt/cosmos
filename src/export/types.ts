export type BriefDurationSec = 45 | 60 | 90;

export type BriefTone = 'contemplative' | 'encyclopedic';

export interface CosmosBriefSection {
  heading?: string;
  narration: string;
  visualHint: string;
  onScreenText?: string;
}

export interface CosmosBriefMetadata {
  eventId: string;
  track: 'material' | 'spiritual';
  tradition?: string;
  visibility?: 'exoteric' | 'esoteric';
  relatedEventIds: string[];
  sourceUrl?: string;
  exportedAt: string;
  epochLabel: string;
  spatialBand?: string;
}

export interface CosmosVideoBrief {
  version: 1;
  pipeline: 'animated-explainer';
  title: string;
  topic: string;
  hook: string;
  tone: BriefTone;
  traditionColor?: string;
  durationTargetSec: BriefDurationSec;
  sections: CosmosBriefSection[];
  metadata: CosmosBriefMetadata;
  openMontage: {
    suggestedPipeline: 'animated_explainer';
    stylePlaybook: 'clean_professional';
    cursorPrompt: string;
  };
}

export interface BuildVideoBriefOptions {
  duration?: BriefDurationSec;
}
