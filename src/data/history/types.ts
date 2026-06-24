export type HistoryDomain = 'cosmic' | 'geologic' | 'biologic' | 'human';

export type SpiritualTradition =
  | 'kabbalah'
  | 'platonism'
  | 'neoplatonism'
  | 'hermetic'
  | 'gnosticism'
  | 'christian_mysticism'
  | 'sufism'
  | 'buddhist_mysticism'
  | 'hindu_mysticism'
  | 'alchemy'
  | 'theosophy'
  | 'general';

export type SpiritualVisibility = 'exoteric' | 'esoteric';

export type DepthOfView = 'exoteric' | 'full';

export interface MaterialEvent {
  id: string;
  simTimeSeconds: number;
  domain: HistoryDomain;
  track: 'material';
  title: string;
  summary: string;
  spatialExponent?: number;
  spatialBand?: string;
  sourceUrl?: string;
  show3DMarker?: boolean;
  relatedSpiritualIds?: string[];
}

export interface SpiritualEvent {
  id: string;
  simTimeSeconds: number;
  track: 'spiritual';
  tradition: SpiritualTradition;
  visibility: SpiritualVisibility;
  title: string;
  summary: string;
  body?: string;
  spatialExponent?: number;
  spatialBand?: string;
  sourceUrl?: string;
  relatedMaterialIds?: string[];
}

export type TimelineEvent = MaterialEvent | SpiritualEvent;

/** @deprecated Use MaterialEvent */
export type HistoryEvent = MaterialEvent;

export const DOMAIN_LABELS: Record<HistoryDomain, string> = {
  cosmic: 'Cosmic',
  geologic: 'Geologic',
  biologic: 'Biologic',
  human: 'Human',
};

export const TRADITION_LABELS: Record<SpiritualTradition, string> = {
  kabbalah: 'Kabbalah',
  platonism: 'Platonism',
  neoplatonism: 'Neoplatonism',
  hermetic: 'Hermetic',
  gnosticism: 'Gnosticism',
  christian_mysticism: 'Christian Mysticism',
  sufism: 'Sufism',
  buddhist_mysticism: 'Buddhism',
  hindu_mysticism: 'Hindu',
  alchemy: 'Alchemy',
  theosophy: 'Theosophy',
  general: 'General',
};

export function isMaterialEvent(event: TimelineEvent): event is MaterialEvent {
  return event.track === 'material';
}

export function isSpiritualEvent(event: TimelineEvent): event is SpiritualEvent {
  return event.track === 'spiritual';
}
