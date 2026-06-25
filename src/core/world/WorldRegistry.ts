import type { AgeDefinition } from '../../data/ages/types';
import { getEventById } from '../../data/history/index';
import { STRUCTURE_KINDS } from '../../data/astral/structures';
import { ALL_AGES, PUZZLE_TEMPLATES } from '../../data/ages/index';
import type { EntityInstance, WorldId } from './types';

export class WorldRegistry {
  readonly ages = new Map<string, AgeDefinition>();
  readonly structureKinds = new Map(STRUCTURE_KINDS.map((s) => [s.id, s]));
  readonly puzzleTemplates = new Map(PUZZLE_TEMPLATES.map((p) => [p.id, p]));

  constructor() {
    for (const age of ALL_AGES) {
      this.ages.set(age.id, age);
    }
    this.validate();
  }

  getAge(id: string): AgeDefinition | undefined {
    return this.ages.get(id);
  }

  validate(): string[] {
    const errors: string[] = [];
    for (const age of this.ages.values()) {
      for (const marker of age.markers) {
        if (!getEventById(marker.eventId)) {
          errors.push(`Age ${age.id}: unknown event ${marker.eventId}`);
        }
      }
      for (const portal of age.portals) {
        if (!this.ages.has(portal.targetAgeId)) {
          errors.push(`Age ${age.id}: portal targets unknown age ${portal.targetAgeId}`);
        }
        if (portal.puzzleId && !this.puzzleTemplates.has(portal.puzzleId)) {
          errors.push(`Age ${age.id}: unknown puzzle ${portal.puzzleId}`);
        }
      }
      if (age.unlock?.requiresPuzzleIds) {
        for (const pid of age.unlock.requiresPuzzleIds) {
          if (!this.puzzleTemplates.has(pid)) {
            errors.push(`Age ${age.id}: unlock references unknown puzzle ${pid}`);
          }
        }
      }
    }
    return errors;
  }
}

export function spawnEntitiesForAge(age: AgeDefinition): EntityInstance[] {
  const entities: EntityInstance[] = [];
  for (const m of age.markers) {
    entities.push({
      id: m.id,
      kind: 'marker',
      defId: m.eventId,
      worldId: age.id,
      layer: 'material',
      transform: { x: m.position[0], z: m.position[1] },
      state: { label: m.label, discovered: false },
    });
  }
  for (const p of age.portals) {
    const marker = age.markers.find((m) => m.eventId === p.markerEventId);
    entities.push({
      id: p.id,
      kind: 'portal',
      defId: p.targetAgeId,
      worldId: age.id,
      layer: 'material',
      transform: marker
        ? { x: marker.position[0], z: marker.position[1] }
        : { x: 0, z: 0 },
      state: { label: p.label, puzzleId: p.puzzleId ?? null, unlocked: !p.puzzleId },
    });
  }
  for (const v of age.veils) {
    entities.push({
      id: v.id,
      kind: 'veil',
      defId: v.id,
      worldId: age.id,
      layer: 'material',
      transform: { x: v.position[0], z: v.position[1] },
      state: { label: v.label },
    });
  }
  for (const puzzle of PUZZLE_TEMPLATES) {
    if (puzzle.markerEventId && age.markers.some((m) => m.eventId === puzzle.markerEventId)) {
      const marker = age.markers.find((m) => m.eventId === puzzle.markerEventId)!;
      entities.push({
        id: `puzzle-${puzzle.id}`,
        kind: 'puzzle-mechanism',
        defId: puzzle.id,
        worldId: age.id,
        layer: 'material',
        transform: { x: marker.position[0] + 1.5, z: marker.position[1] },
        state: {
          ringRotations: [0, 0, 0],
          stanceHeld: false,
          eraWitnessed: false,
          completed: false,
        },
      });
    }
  }
  return entities;
}

export function spawnAllWorldEntities(): EntityInstance[] {
  const all: EntityInstance[] = [];
  for (const age of ALL_AGES) {
    all.push(...spawnEntitiesForAge(age));
  }
  return all;
}

export const worldRegistry = new WorldRegistry();

export function getActiveAgeDefinition(worldId: WorldId): AgeDefinition {
  return worldRegistry.getAge(worldId) ?? worldRegistry.getAge('grove')!;
}
