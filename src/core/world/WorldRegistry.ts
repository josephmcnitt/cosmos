import type { AgeDefinition } from '../../data/ages/types';
import { ALL_ACTORS } from '../../data/actors/index';
import { ALL_INITIATIONS } from '../../data/initiations/index';
import { ALL_AGES, PUZZLE_TEMPLATES } from '../../data/ages/index';
import { ALL_PROGRESS_NODES } from '../../data/progression/index';
import { getEventById } from '../../data/history/index';
import { STRUCTURE_KINDS } from '../../data/astral/structures';
import type { ActorDefinition } from '../../data/ages/types';
import type { EntityInstance, WorldId } from './types';

export class WorldRegistry {
  readonly ages = new Map<string, AgeDefinition>();
  readonly actorDefs = new Map<string, ActorDefinition>();
  readonly structureKinds = new Map(STRUCTURE_KINDS.map((s) => [s.id, s]));
  readonly puzzleTemplates = new Map(PUZZLE_TEMPLATES.map((p) => [p.id, p]));

  readonly progressNodes = new Map(ALL_PROGRESS_NODES.map((n) => [n.id, n]));

  constructor() {
    for (const age of ALL_AGES) {
      this.ages.set(age.id, age);
    }
    for (const actor of ALL_ACTORS) {
      this.actorDefs.set(actor.id, actor);
    }
    this.validate();
  }

  getAge(id: string): AgeDefinition | undefined {
    return this.ages.get(id);
  }

  getActor(id: string): ActorDefinition | undefined {
    return this.actorDefs.get(id);
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
      if (age.terrain.size < age.terrain.siteHalfSize * 2) {
        errors.push(`Age ${age.id}: terrain size is smaller than site bounds`);
      }
      const buildingIds = new Set<string>();
      for (const building of age.scenery?.buildings ?? []) {
        if (buildingIds.has(building.id)) {
          errors.push(`Age ${age.id}: duplicate building ${building.id}`);
        }
        buildingIds.add(building.id);
        const [x, , z] = building.position;
        if (Math.abs(x) > age.terrain.siteHalfSize || Math.abs(z) > age.terrain.siteHalfSize) {
          errors.push(`Age ${age.id}: building ${building.id} outside site bounds`);
        }
      }
    }
    for (const actor of ALL_ACTORS) {
      if (!this.ages.has(actor.worldId)) {
        errors.push(`Actor ${actor.id}: unknown world ${actor.worldId}`);
      }
      if (actor.initiationId && !ALL_INITIATIONS.find((i) => i.id === actor.initiationId)) {
        errors.push(`Actor ${actor.id}: unknown initiation ${actor.initiationId}`);
      }
    }
    for (const initiation of ALL_INITIATIONS) {
      if (!this.ages.has(initiation.worldId)) {
        errors.push(`Initiation ${initiation.id}: unknown world ${initiation.worldId}`);
      }
      const postInitDialogue = initiation.postInitDialogue;
      if (postInitDialogue) {
        const progressFlag = postInitDialogue.progressFlag.trim();
        if (!progressFlag) {
          errors.push(`Initiation ${initiation.id}: post-init dialogue missing progress flag`);
        }
        const flagIsSet = ALL_PROGRESS_NODES.some((node) =>
          node.effects.some((effect) => effect.type === 'setPathFlag' && effect.flag === progressFlag),
        );
        if (!flagIsSet) {
          errors.push(`Initiation ${initiation.id}: post-init dialogue flag ${progressFlag} is never set`);
        }
      }
    }
    for (const node of ALL_PROGRESS_NODES) {
      for (const req of node.requires) {
        if (req.type === 'nodeCompleted' && !this.progressNodes.has(req.nodeId)) {
          errors.push(`Progress node ${node.id}: unknown prerequisite ${req.nodeId}`);
        }
        if (req.type === 'choiceMade' && !ALL_INITIATIONS.find((i) => i.id === req.initiationId)) {
          errors.push(`Progress node ${node.id}: unknown initiation ${req.initiationId}`);
        }
        if (req.type === 'puzzleCompleted' && !this.puzzleTemplates.has(req.puzzleId)) {
          errors.push(`Progress node ${node.id}: unknown puzzle ${req.puzzleId}`);
        }
        if (req.type === 'ageVisited' && !this.ages.has(req.worldId)) {
          errors.push(`Progress node ${node.id}: unknown age ${req.worldId}`);
        }
        if (req.type === 'initiationCompleted' && !this.ages.has(req.worldId)) {
          errors.push(`Progress node ${node.id}: unknown age ${req.worldId}`);
        }
      }
      for (const effect of node.effects) {
        if (effect.type === 'revealMarker') {
          const age = this.ages.get(effect.worldId);
          if (!age?.markers.some((m) => m.id === effect.markerId)) {
            errors.push(`Progress node ${node.id}: unknown marker ${effect.markerId}`);
          }
        }
        if (effect.type === 'unlockWorld' && !this.ages.has(effect.worldId)) {
          errors.push(`Progress node ${node.id}: unknown unlock world ${effect.worldId}`);
        }
        if (effect.type === 'unlockPortal') {
          let found = false;
          for (const age of this.ages.values()) {
            if (age.portals.some((p) => p.id === effect.portalId)) {
              found = true;
              break;
            }
          }
          if (!found) errors.push(`Progress node ${node.id}: unknown portal ${effect.portalId}`);
        }
      }
    }
    return errors;
  }
}

function markerInitiallyHidden(marker: { hiddenUntilNode?: string }): boolean {
  return Boolean(marker.hiddenUntilNode);
}

export function spawnEntitiesForAge(age: AgeDefinition): EntityInstance[] {
  const entities: EntityInstance[] = [];
  const actors = ALL_ACTORS.filter((a) => a.worldId === age.id);
  for (const actor of actors) {
    entities.push({
      id: actor.id,
      kind: 'actor',
      defId: actor.id,
      worldId: age.id,
      layer: 'material',
      transform: { x: actor.position[0], z: actor.position[1], yaw: actor.yaw ?? 0 },
      state: { displayName: actor.displayName, robeColor: actor.robeColor },
    });
  }
  for (const m of age.markers) {
    const progressHidden = markerInitiallyHidden(m);
    entities.push({
      id: m.id,
      kind: 'marker',
      defId: m.eventId,
      worldId: age.id,
      layer: 'material',
      transform: { x: m.position[0], z: m.position[1] },
      state: {
        label: m.label,
        discovered: false,
        progressHidden,
        progressRevealed: !progressHidden,
        hiddenUntilNode: m.hiddenUntilNode ?? null,
      },
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
      state: { label: p.label, puzzleId: p.puzzleId ?? null, unlocked: false },
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

/** Merge saved entities with the current spawn catalog — adds missing NPCs/markers without wiping progress. */
export function repairWorldEntities(existing: EntityInstance[] | undefined): EntityInstance[] {
  const fresh = spawnAllWorldEntities();
  if (!existing?.length) return fresh;

  const byId = new Map(existing.map((entity) => [entity.id, entity]));
  return fresh.map((entity) => {
    const saved = byId.get(entity.id);
    if (!saved) return entity;
    if (entity.kind === 'actor') {
      return { ...saved, transform: entity.transform, state: { ...entity.state, ...saved.state } };
    }
    return saved;
  });
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
