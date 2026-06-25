import { getContemplationLine } from '../data/practice/contemplations';
import { getCrossLinks, getEventById } from '../data/history/index';
import {
  isMaterialEvent,
  isSpiritualEvent,
  TRADITION_LABELS,
  type TimelineEvent,
} from '../data/history/types';
import { MARKER_TRADITION_COLORS } from '../data/embodied/siteMarkers';
import { SPATIAL_BANDS } from '../core/ScaleSpace';
import { formatSimTime } from '../core/TimeSpace';
import { buildCursorPrompt } from './cursorPrompt';
import type {
  BriefDurationSec,
  BriefTone,
  BuildVideoBriefOptions,
  CosmosBriefSection,
  CosmosVideoBrief,
} from './types';

const MAX_SENTENCES = 2;

function truncateToSentences(text: string, maxSentences = MAX_SENTENCES): string {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts) return text.trim();
  return parts.slice(0, maxSentences).join(' ').trim();
}

function splitIntoChunks(text: string, maxChunks: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  if (sentences.length <= maxChunks) {
    return sentences.map((s) => s.trim()).filter(Boolean);
  }
  const chunkSize = Math.ceil(sentences.length / maxChunks);
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(sentences.slice(i, i + chunkSize).join(' ').trim());
  }
  return chunks.filter(Boolean).slice(0, maxChunks);
}

function bandLabel(event: TimelineEvent): string | undefined {
  const id = event.spatialBand;
  if (!id) return undefined;
  return SPATIAL_BANDS.find((b) => b.id === id)?.label ?? id;
}

function hookForEvent(event: TimelineEvent): string {
  if (isSpiritualEvent(event)) {
    const line = getContemplationLine(event.tradition, 0);
    return `${event.title}. ${line}`;
  }
  return `${event.title}. ${truncateToSentences(event.summary, 1)}`;
}

function toneForEvent(event: TimelineEvent): BriefTone {
  if (isSpiritualEvent(event) && event.visibility === 'esoteric') {
    return 'contemplative';
  }
  return 'encyclopedic';
}

function contextSection(event: TimelineEvent): CosmosBriefSection {
  const epochLabel = formatSimTime(event.simTimeSeconds);
  const spatial = bandLabel(event);

  if (isSpiritualEvent(event)) {
    const tradition = TRADITION_LABELS[event.tradition];
    return {
      heading: 'Context',
      narration: `In ${epochLabel}, within the ${tradition} stream of spiritual history${spatial ? ` — at ${spatial} scale` : ''} — a door opens.`,
      visualHint: `Era card: ${epochLabel}; tradition motif in ${event.tradition} palette; subtle symbolic geometry.`,
      onScreenText: tradition,
    };
  }

  return {
    heading: 'Context',
    narration: `Around ${epochLabel}${spatial ? `, viewed from ${spatial} scale` : ''}, this moment enters the material record.`,
    visualHint: `Timeline scrub to ${epochLabel}; cosmic-to-human scale hint if ${event.domain}.`,
    onScreenText: epochLabel,
  };
}

function coreSections(event: TimelineEvent, duration: BriefDurationSec): CosmosBriefSection[] {
  const maxChunks = duration === 45 ? 1 : duration === 60 ? 2 : 3;
  const source = isSpiritualEvent(event) && event.body ? event.body : event.summary;
  const chunks = splitIntoChunks(source, maxChunks);

  return chunks.map((chunk, i) => ({
    heading: i === 0 ? 'The mystery' : undefined,
    narration: chunk,
    visualHint: isSpiritualEvent(event)
      ? `Abstract esoteric imagery — ${event.tradition}; textural, luminous, not literal.`
      : `Documentary-style illustration for ${isMaterialEvent(event) ? event.domain : 'human'} history.`,
    onScreenText: i === 0 ? event.title : undefined,
  }));
}

function crossLinkSection(event: TimelineEvent): CosmosBriefSection | null {
  const links = getCrossLinks(event.id);
  const related = [...links.material, ...links.spiritual].slice(0, 3);
  if (related.length === 0) return null;

  const titles = related.map((e) => e.title).join(', ');
  const trackLabel =
    links.material.length > 0 && links.spiritual.length > 0
      ? 'material and spiritual history'
      : links.material.length > 0
        ? 'material history'
        : 'spiritual history';

  return {
    heading: 'Parallel threads',
    narration: `This moment echoes elsewhere in ${trackLabel}: ${titles}.`,
    visualHint: 'Split-screen or cross-fade between linked topics; connection lines between titles.',
    onScreenText: 'Related',
  };
}

function closeSection(event: TimelineEvent): CosmosBriefSection {
  const attribution = event.sourceUrl
    ? 'Learn more from the sources cited in Cosmos.'
    : 'Explore further in Cosmos.';
  return {
    heading: 'Cosmos',
    narration: `${attribution} Zoom out to the universe. Zoom in to walk the stones. The hidden streams wait.`,
    visualHint: 'Cosmos wordmark; starfield fading to a single glowing stone; contemplative outro.',
    onScreenText: 'Cosmos',
  };
}

export function buildVideoBrief(
  eventId: string,
  options: BuildVideoBriefOptions = {},
): CosmosVideoBrief | null {
  const event = getEventById(eventId);
  if (!event?.title || !event.summary) return null;

  const durationTargetSec: BriefDurationSec = options.duration ?? 60;
  const crossLinks = getCrossLinks(eventId);
  const relatedEventIds = [
    ...crossLinks.material.map((e) => e.id),
    ...crossLinks.spiritual.map((e) => e.id),
  ];

  const sections: CosmosBriefSection[] = [
    {
      heading: 'Opening',
      narration: hookForEvent(event),
      visualHint: isSpiritualEvent(event)
        ? `Slow zoom on illuminated manuscript / symbolic stone — ${event.tradition} color accent.`
        : 'Cinematic title card over cosmic scale imagery.',
      onScreenText: event.title,
    },
    contextSection(event),
    ...coreSections(event, durationTargetSec),
  ];

  const crossSection = crossLinkSection(event);
  if (crossSection) sections.push(crossSection);
  sections.push(closeSection(event));

  const traditionColor =
    isSpiritualEvent(event) ? MARKER_TRADITION_COLORS[event.tradition] : undefined;

  const brief: CosmosVideoBrief = {
    version: 1,
    pipeline: 'animated-explainer',
    title: event.title,
    topic: event.title,
    hook: hookForEvent(event),
    tone: toneForEvent(event),
    traditionColor,
    durationTargetSec,
    sections,
    metadata: {
      eventId: event.id,
      track: event.track,
      tradition: isSpiritualEvent(event) ? event.tradition : undefined,
      visibility: isSpiritualEvent(event) ? event.visibility : undefined,
      relatedEventIds,
      sourceUrl: event.sourceUrl,
      exportedAt: new Date().toISOString(),
      epochLabel: formatSimTime(event.simTimeSeconds),
      spatialBand: bandLabel(event),
    },
    openMontage: {
      suggestedPipeline: 'animated_explainer',
      stylePlaybook: 'clean_professional',
      cursorPrompt: '',
    },
  };

  brief.openMontage.cursorPrompt = buildCursorPrompt(brief);
  return brief;
}
