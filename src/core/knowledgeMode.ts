import type { TimelineEvent, KnowledgeMode } from '../data/history/types';
import { isSpiritualEvent } from '../data/history/types';
import type { RealmPhase } from './PracticeState';

export type { KnowledgeMode };

export const KNOWLEDGE_MODE_LABELS: Record<KnowledgeMode, string> = {
  rational: 'Rational',
  faith: 'Faith',
  experience: 'Experience',
  gnosis: 'Gnosis',
};

/** Infer primary knowledge mode from event + current practice/realm state. */
export function inferKnowledgeMode(
  event: TimelineEvent | null,
  realmPhase: RealmPhase,
  practicing: boolean,
): KnowledgeMode {
  if (realmPhase === 'spiritual') return 'gnosis';
  if (practicing || realmPhase === 'liminal') return 'experience';

  if (event && isSpiritualEvent(event)) {
    return event.visibility === 'esoteric' ? 'rational' : 'faith';
  }

  return 'rational';
}

/** Optional explicit tag on events — falls back to inferKnowledgeMode. */
export function resolveKnowledgeMode(
  event: TimelineEvent | null,
  realmPhase: RealmPhase,
  practicing: boolean,
): KnowledgeMode {
  if (event?.knowledgeMode) {
    return event.knowledgeMode;
  }
  return inferKnowledgeMode(event, realmPhase, practicing);
}
