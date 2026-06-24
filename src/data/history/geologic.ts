import type { MaterialEvent } from './types';
import { yearsAfterBB, yearsAgo } from './time';

export const GEOLOGIC_EVENTS: MaterialEvent[] = [
  {
    id: 'earth-forms',
    simTimeSeconds: yearsAfterBB(4.54e9),
    domain: 'geologic',
    track: 'material',
    title: 'Earth forms',
    summary:
      'Dust and rock in the solar nebula accrete into a molten proto-Earth. Heavy elements sink to form a core; lighter silicates rise toward the surface.',
    spatialBand: 'planetary',
    spatialExponent: 14,
    show3DMarker: true,
    sourceUrl: 'https://en.wikipedia.org/wiki/Formation_and_evolution_of_the_Solar_System',
  },
  {
    id: 'moon-impact',
    simTimeSeconds: yearsAfterBB(4.51e9),
    domain: 'geologic',
    track: 'material',
    title: 'Moon born from impact',
    summary:
      'A Mars-sized body collides with the young Earth, ejecting debris that coalesces into the Moon — stabilizing Earth\'s tilt and tides for billions of years.',
    spatialBand: 'planetary',
    spatialExponent: 14,
    show3DMarker: true,
    sourceUrl: 'https://en.wikipedia.org/wiki/Giant-impact_hypothesis',
  },
  {
    id: 'late-heavy-bombardment',
    simTimeSeconds: yearsAfterBB(4.1e9),
    domain: 'geologic',
    track: 'material',
    title: 'Late Heavy Bombardment',
    summary:
      'A surge of asteroid and comet impacts craters the inner planets, possibly delivering water and organic molecules to Earth.',
    spatialBand: 'planetary',
    spatialExponent: 14,
    sourceUrl: 'https://en.wikipedia.org/wiki/Late_Heavy_Bombardment',
  },
  {
    id: 'first-oceans',
    simTimeSeconds: yearsAfterBB(4.0e9),
    domain: 'geologic',
    track: 'material',
    title: 'First oceans',
    summary:
      'Earth\'s surface cools enough for water vapor to condense, forming global seas that will become the crucible for life.',
    spatialBand: 'planetary',
    spatialExponent: 14,
    show3DMarker: true,
    sourceUrl: 'https://en.wikipedia.org/wiki/Origin_of_water_on_Earth',
  },
  {
    id: 'plate-tectonics',
    simTimeSeconds: yearsAfterBB(3.2e9),
    domain: 'geologic',
    track: 'material',
    title: 'Plate tectonics begin',
    summary:
      'Earth\'s lithosphere breaks into moving plates, recycling crust and regulating climate through the carbon cycle — a rarity among rocky worlds.',
    spatialBand: 'terrestrial',
    spatialExponent: 10,
    sourceUrl: 'https://en.wikipedia.org/wiki/Plate_tectonics',
  },
  {
    id: 'snowball-earth',
    simTimeSeconds: yearsAfterBB(2.4e9),
    domain: 'geologic',
    track: 'material',
    title: 'Snowball Earth',
    summary:
      'Global glaciation may have frozen oceans to the equator, testing life\'s resilience before a volcanic and greenhouse rebound melted the ice.',
    spatialBand: 'terrestrial',
    spatialExponent: 10,
    sourceUrl: 'https://en.wikipedia.org/wiki/Snowball_Earth',
  },
  {
    id: 'pangaea',
    simTimeSeconds: yearsAfterBB(0.335e9),
    domain: 'geologic',
    track: 'material',
    title: 'Supercontinent Pangaea',
    summary:
      'Earth\'s continents merge into a single supercontinent surrounded by one global ocean — reshaping climate and evolution for tens of millions of years.',
    spatialBand: 'terrestrial',
    spatialExponent: 9,
    sourceUrl: 'https://en.wikipedia.org/wiki/Pangaea',
  },
  {
    id: 'dinosaur-extinction-impact',
    simTimeSeconds: yearsAgo(66e6),
    domain: 'geologic',
    track: 'material',
    title: 'Chicxulub impact',
    summary:
      'A ten-kilometer asteroid strikes the Yucatán, triggering global wildfires and a "impact winter" that ends the age of non-avian dinosaurs.',
    spatialBand: 'terrestrial',
    spatialExponent: 8,
    sourceUrl: 'https://en.wikipedia.org/wiki/Chicxulub_crater',
  },
  {
    id: 'ice-ages',
    simTimeSeconds: yearsAgo(2.6e6),
    domain: 'geologic',
    track: 'material',
    title: 'Pleistocene ice ages',
    summary:
      'Repeated glacial cycles sculpt landscapes and drive human adaptation as ice sheets advance and retreat across the Northern Hemisphere.',
    spatialBand: 'terrestrial',
    spatialExponent: 8,
    sourceUrl: 'https://en.wikipedia.org/wiki/Quaternary_glaciation',
  },
  {
    id: 'holocene',
    simTimeSeconds: yearsAgo(11.7e3),
    domain: 'geologic',
    track: 'material',
    title: 'Holocene epoch',
    summary:
      'The current interglacial brings a stable, warm climate that enables agriculture, cities, and the rapid growth of human civilization.',
    spatialBand: 'terrestrial',
    spatialExponent: 8,
    sourceUrl: 'https://en.wikipedia.org/wiki/Holocene',
  },
];
