import type { MaterialEvent } from './types';
import { yearsAfterBB } from './time';

export const COSMIC_EVENTS: MaterialEvent[] = [
  {
    id: 'big-bang',
    simTimeSeconds: 0,
    domain: 'cosmic',
    track: 'material',
    title: 'The Big Bang',
    summary:
      'The universe begins — space, time, energy, and matter emerge from an extremely hot, dense state. Within fractions of a second, expansion and cooling set the stage for all structure to come.',
    spatialBand: 'universe',
    spatialExponent: 25,
    sourceUrl: 'https://en.wikipedia.org/wiki/Big_Bang',
  },
  {
    id: 'inflation',
    simTimeSeconds: 1e-30,
    domain: 'cosmic',
    track: 'material',
    title: 'Cosmic inflation',
    summary:
      'The universe undergoes a brief exponential expansion, smoothing its geometry and planting the seeds of future galaxies as quantum fluctuations are stretched across the cosmos.',
    spatialBand: 'universe',
    spatialExponent: 25,
    sourceUrl: 'https://en.wikipedia.org/wiki/Inflation_(cosmology)',
  },
  {
    id: 'first-stars',
    simTimeSeconds: yearsAfterBB(180e6),
    domain: 'cosmic',
    track: 'material',
    title: 'First stars ignite',
    summary:
      'Gravity pulls together the first clouds of hydrogen and helium, forming massive Population III stars that reionize the universe and forge the first heavy elements.',
    spatialBand: 'galaxy',
    spatialExponent: 22,
    sourceUrl: 'https://en.wikipedia.org/wiki/Population_III_stars',
  },
  {
    id: 'reionization',
    simTimeSeconds: yearsAfterBB(500e6),
    domain: 'cosmic',
    track: 'material',
    title: 'Cosmic reionization',
    summary:
      'Ultraviolet light from early stars and galaxies strips electrons from hydrogen, turning the foggy universe transparent and ending the cosmic "dark ages."',
    spatialBand: 'galaxy',
    spatialExponent: 22,
    sourceUrl: 'https://en.wikipedia.org/wiki/Reionization',
  },
  {
    id: 'milky-way-forms',
    simTimeSeconds: yearsAfterBB(9.5e9),
    domain: 'cosmic',
    track: 'material',
    title: 'Milky Way coalesces',
    summary:
      'Our galaxy assembles from merging protogalaxies and accreted gas, settling into a spiral disk where later generations of stars — including our Sun — will form.',
    spatialBand: 'galaxy',
    spatialExponent: 21,
    sourceUrl: 'https://en.wikipedia.org/wiki/Milky_Way',
  },
  {
    id: 'sun-forms',
    simTimeSeconds: yearsAfterBB(9.2e9),
    domain: 'cosmic',
    track: 'material',
    title: 'The Sun forms',
    summary:
      'A cloud of gas and dust collapses in a spiral arm of the Milky Way, igniting a G-type main-sequence star that will host the solar system.',
    spatialBand: 'stellar',
    spatialExponent: 18,
    sourceUrl: 'https://en.wikipedia.org/wiki/Sun',
  },
  {
    id: 'heavy-elements',
    simTimeSeconds: yearsAfterBB(9e9),
    domain: 'cosmic',
    track: 'material',
    title: 'Stellar nucleosynthesis peaks',
    summary:
      'Generations of stars enrich the galaxy with carbon, oxygen, iron, and other elements essential for rocky planets and life — we are literally made of dead stars.',
    spatialBand: 'stellar',
    spatialExponent: 17,
    sourceUrl: 'https://en.wikipedia.org/wiki/Stellar_nucleosynthesis',
  },
  {
    id: 'dark-energy',
    simTimeSeconds: yearsAfterBB(9.8e9),
    domain: 'cosmic',
    track: 'material',
    title: 'Dark energy dominates',
    summary:
      'Roughly five billion years before the present, the expansion of the universe begins accelerating — a discovery that reshaped cosmology and our picture of the far future.',
    spatialBand: 'universe',
    spatialExponent: 24,
    sourceUrl: 'https://en.wikipedia.org/wiki/Accelerating_expansion_of_the_universe',
  },
];
