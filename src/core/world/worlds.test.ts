import { describe, expect, it } from 'vitest';
import { ALL_AGES } from '../../data/ages/index';
import { PUZZLE_TEMPLATES } from '../../data/ages/puzzles';
import { ALL_ACTORS } from '../../data/actors/index';
import { ALL_INITIATIONS } from '../../data/initiations/index';
import { getSiteAnchorsAtTimeForPack } from '../../data/earth';
import { EARTH_SITE_COORDS } from '../../data/earth/siteCoordinates';
import { ceYear, yearsAgo } from '../../data/history/time';
import { worldRegistry, spawnEntitiesForAge } from './WorldRegistry';
import { BYZANTIUM_AGE } from '../../data/ages/byzantium';
import { CORDOBA_AGE } from '../../data/ages/cordoba';
import { DESERT_AGE } from '../../data/ages/desert';

describe('WorldRegistry expanded ages', () => {
  it('registers eight playable ages with clean validation', () => {
    expect(ALL_AGES.map((a) => a.id)).toEqual([
      'grove',
      'alexandria',
      'rome',
      'desert',
      'byzantium',
      'cordoba',
      'safed',
      'cologne',
    ]);
    expect(worldRegistry.validate()).toEqual([]);
  });

  it('spawns actors, markers, and portals for Safed and Cologne', () => {
    const safed = spawnEntitiesForAge(ALL_AGES.find((a) => a.id === 'safed')!);
    expect(safed.some((e) => e.id === 'safed-disciple')).toBe(true);
    expect(safed.filter((e) => e.kind === 'marker').length).toBe(4);
    expect(safed.some((e) => e.id === 'portal-safed-cologne')).toBe(true);
    expect(safed.some((e) => e.id === 'puzzle-safed-puzzle-saturn-square')).toBe(true);

    const cologne = spawnEntitiesForAge(ALL_AGES.find((a) => a.id === 'cologne')!);
    expect(cologne.some((e) => e.id === 'cologne-scribe')).toBe(true);
    expect(cologne.some((e) => e.id === 'portal-cologne-safed')).toBe(true);
  });

  it('spawns actors and markers for Byzantium and Cordoba', () => {
    const byz = spawnEntitiesForAge(BYZANTIUM_AGE);
    expect(byz.some((e) => e.id === 'byzantium-scribe')).toBe(true);
    expect(byz.filter((e) => e.kind === 'marker').length).toBe(3);

    const cord = spawnEntitiesForAge(CORDOBA_AGE);
    expect(cord.some((e) => e.id === 'cordoba-translator')).toBe(true);
    expect(cord.some((e) => e.id === 'portal-alex-cordoba')).toBe(false);
    expect(cord.some((e) => e.id === 'portal-cordoba-grove')).toBe(true);
  });

  it('wires spoke portals from Rome and Alexandria to new ages', () => {
    const rome = ALL_AGES.find((a) => a.id === 'rome')!;
    const alex = ALL_AGES.find((a) => a.id === 'alexandria')!;
    expect(rome.portals.some((p) => p.targetAgeId === 'byzantium')).toBe(true);
    expect(alex.portals.some((p) => p.targetAgeId === 'cordoba')).toBe(true);
  });

  it('every age has actor, initiation, and puzzle unlock path except grove', () => {
    for (const age of ALL_AGES) {
      expect(ALL_ACTORS.some((a) => a.worldId === age.id)).toBe(true);
      expect(ALL_INITIATIONS.some((i) => i.worldId === age.id)).toBe(true);
      if (age.id === 'grove') continue;
      expect(age.unlock?.requiresPuzzleIds?.length).toBeGreaterThan(0);
      for (const pid of age.unlock!.requiresPuzzleIds!) {
        expect(PUZZLE_TEMPLATES.some((p) => p.id === pid)).toBe(true);
      }
    }
  });

  it('earth pins exist at playable times for all geo-anchored ages', () => {
    const atPresent = getSiteAnchorsAtTimeForPack(yearsAgo(0));
    expect(atPresent.some((s) => s.id === 'athens')).toBe(true);
    expect(atPresent.some((s) => s.id === 'rome')).toBe(true);

    const at500 = getSiteAnchorsAtTimeForPack(ceYear(500));
    expect(at500.some((s) => s.id === 'constantinople')).toBe(true);

    const at900 = getSiteAnchorsAtTimeForPack(ceYear(900));
    expect(at900.some((s) => s.id === 'cordoba')).toBe(true);

    const at200 = getSiteAnchorsAtTimeForPack(ceYear(200));
    expect(at200.some((s) => s.id === 'scetes')).toBe(true);
  });

  it('desert uses desert-fathers marker and scetes coordinates', () => {
    expect(DESERT_AGE.geoAnchor).toEqual(EARTH_SITE_COORDS.scetes);
    expect(DESERT_AGE.markers.some((m) => m.eventId === 'desert-fathers')).toBe(true);
    expect(DESERT_AGE.markers.some((m) => m.eventId === 'christianity')).toBe(false);
  });
});
