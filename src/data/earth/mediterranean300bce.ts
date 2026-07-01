import { ceYear, yearsAgo } from '../history/time';
import type { PolityPack } from './types';
import { EARTH_SITE_COORDS } from './siteCoordinates';

const T_300BCE = ceYear(-300);
const T_PRESENT = yearsAgo(0);

/** Coarse Mediterranean polities — symbolic outlines, not GIS-accurate. */
export const MEDITERRANEAN_PACK: PolityPack = {
  id: 'mediterranean',
  label: 'Mediterranean (continental base)',
  snapshots: [
    // ~300 BCE
    {
      id: 'ptolemaic-300',
      polityId: 'ptolemaic-egypt',
      simTimeSeconds: T_300BCE,
      displayName: 'Ptolemaic Egypt',
      kind: 'polity',
      color: '#c9a227',
      rings: [
        [
          [24, 31],
          [36, 31],
          [36, 24],
          [32, 22],
          [28, 22],
          [24, 26],
          [24, 31],
        ],
      ],
      linkedEventIds: ['library-alexandria'],
    },
    {
      id: 'seleucid-300',
      polityId: 'seleucid',
      simTimeSeconds: T_300BCE,
      displayName: 'Seleucid Empire',
      kind: 'empire',
      color: '#8b6914',
      rings: [
        [
          [36, 36],
          [48, 38],
          [52, 34],
          [48, 28],
          [40, 26],
          [36, 30],
          [36, 36],
        ],
      ],
    },
    {
      id: 'rome-republic-300',
      polityId: 'rome',
      simTimeSeconds: T_300BCE,
      displayName: 'Roman Republic',
      kind: 'polity',
      color: '#a0522d',
      rings: [
        [
          [7, 46],
          [19, 46],
          [19, 40],
          [14, 37],
          [8, 38],
          [7, 42],
          [7, 46],
        ],
      ],
      linkedEventIds: ['plato'],
    },
    {
      id: 'macedon-greece-300',
      polityId: 'macedon-greece',
      simTimeSeconds: T_300BCE,
      displayName: 'Macedon & Greece',
      kind: 'polity',
      color: '#4a7c59',
      rings: [
        [
          [19, 42],
          [28, 42],
          [28, 35],
          [23, 34],
          [19, 38],
          [19, 42],
        ],
      ],
      linkedEventIds: ['plato'],
    },
    // Present — simplified modern outlines for scrub morph demo
    {
      id: 'egypt-present',
      polityId: 'ptolemaic-egypt',
      simTimeSeconds: T_PRESENT,
      displayName: 'Egypt',
      kind: 'state',
      color: '#c9a227',
      rings: [
        [
          [25, 31],
          [35, 31],
          [35, 22],
          [30, 22],
          [25, 26],
          [25, 31],
        ],
      ],
    },
    {
      id: 'turkey-present',
      polityId: 'seleucid',
      simTimeSeconds: T_PRESENT,
      displayName: 'Turkey & Levant',
      kind: 'state',
      color: '#8b6914',
      rings: [
        [
          [26, 42],
          [44, 42],
          [44, 32],
          [36, 30],
          [26, 34],
          [26, 42],
        ],
      ],
    },
    {
      id: 'italy-present',
      polityId: 'rome',
      simTimeSeconds: T_PRESENT,
      displayName: 'Italy',
      kind: 'state',
      color: '#a0522d',
      rings: [
        [
          [7, 47],
          [19, 47],
          [19, 36],
          [12, 37],
          [7, 42],
          [7, 47],
        ],
      ],
    },
    {
      id: 'greece-present',
      polityId: 'macedon-greece',
      simTimeSeconds: T_PRESENT,
      displayName: 'Greece',
      kind: 'state',
      color: '#4a7c59',
      rings: [
        [
          [19, 41],
          [28, 41],
          [28, 35],
          [21, 35],
          [19, 38],
          [19, 41],
        ],
      ],
    },
  ],
  sites: [
    {
      id: 'alexandria',
      geo: EARTH_SITE_COORDS.alexandria,
      simTimeStart: ceYear(-330),
      simTimeEnd: ceYear(640),
      ageId: 'alexandria',
      linkedEventIds: ['library-alexandria'],
    },
    {
      id: 'athens',
      geo: EARTH_SITE_COORDS.athens,
      simTimeStart: ceYear(-500),
      simTimeEnd: T_PRESENT,
      ageId: 'grove',
      linkedEventIds: ['plato'],
    },
    {
      id: 'rome',
      geo: EARTH_SITE_COORDS.rome,
      simTimeStart: ceYear(-500),
      simTimeEnd: T_PRESENT,
      ageId: 'rome',
      linkedEventIds: ['neoplatonism-plotinus'],
    },
  ],
};
