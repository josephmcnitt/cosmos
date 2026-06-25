import { worldRegistry } from '../world/WorldRegistry';
import { useWorldStore } from '../world/WorldState';
import { worldEvents } from '../world/WorldEvents';
import type { SimInstance } from '../world/types';
import { simDirector, type InstanceTickFn } from '../world/SimDirector';

const SENSE_COOLDOWN_MS = 120_000;
const BUILD_RATE = 0.15;

export function createAstralTickFn(pairId: string): InstanceTickFn {
  return (instance, dtSec) => {
    const world = useWorldStore.getState();
    const pair = world.entanglements.find((p) => p.id === pairId);
    if (!pair) return;

    const agent = instance.agentState ?? { phase: 'idle' as const };
    const structures = world.entities.filter(
      (e) => e.worldId === instance.worldId && e.kind === 'structure' && e.layer === 'esoteric',
    );

    let next = { ...agent };

    if (next.phase === 'idle' || next.phase === 'resting') {
      const blueprint = pair.pendingBlueprints[0];
      if (blueprint) {
        next = {
          phase: 'walking',
          targetX: blueprint.x,
          targetZ: blueprint.z,
          buildEntityId: undefined,
          buildProgress: 0,
        };
      } else if (structures.length > 0) {
        const target = structures[Math.floor(Math.random() * structures.length)]!;
        next = {
          phase: 'walking',
          targetX: target.transform.x,
          targetZ: target.transform.z,
        };
      }
    }

    if (next.phase === 'walking' && next.targetX != null && next.targetZ != null) {
      const dx = next.targetX - (instance.entityId ? 0 : 0);
      const dz = next.targetZ - (instance.entityId ? 0 : 0);
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 0.5) {
        const blueprint = pair.pendingBlueprints[0];
        if (blueprint) {
          const entityId = `structure-${Date.now()}`;
          useWorldStore.setState((s) => ({
            entities: [
              ...s.entities,
              {
                id: entityId,
                kind: 'structure' as const,
                defId: blueprint.kindId,
                worldId: instance.worldId,
                layer: 'esoteric' as const,
                transform: { x: blueprint.x, z: blueprint.z },
                state: { progress: 0, complete: false },
              },
            ],
            entanglements: s.entanglements.map((p) =>
              p.id === pairId
                ? { ...p, pendingBlueprints: p.pendingBlueprints.slice(1) }
                : p,
            ),
          }));
          useWorldStore.getState().persist();
          next = {
            phase: 'building',
            buildEntityId: entityId,
            buildProgress: 0,
          };
        } else {
          next = { phase: 'practicing', buildProgress: 0 };
        }
      }
    }

    if (next.phase === 'building' && next.buildEntityId) {
      const progress = (next.buildProgress ?? 0) + BUILD_RATE * dtSec;
      const kind = world.entities.find((e) => e.id === next.buildEntityId);
      const kindDef = kind ? worldRegistry.structureKinds.get(kind.defId) : undefined;
      const duration = kindDef?.buildDurationSec ?? 60;
      if (progress >= duration) {
        useWorldStore.getState().updateEntity(next.buildEntityId, (e) => ({
          ...e,
          state: { ...e.state, progress: 1, complete: true },
        }));
        worldEvents.emit({
          type: 'structure/completed',
          entityId: next.buildEntityId,
          worldId: instance.worldId,
        });
        maybeEmitSense(pair, 'Something takes shape in the astral court.');
        next = { phase: 'resting' };
      } else {
        useWorldStore.getState().updateEntity(next.buildEntityId, (e) => ({
          ...e,
          state: { ...e.state, progress: progress / duration },
        }));
        next = { ...next, buildProgress: progress };
      }
    }

    if (next.phase === 'practicing') {
      useWorldStore.getState().updateEntanglement(pairId, {
        strength: Math.min(1, pair.strength + dtSec * 0.02),
      });
      if (Math.random() < dtSec * 0.01) {
        maybeEmitSense(pair, 'The astral self holds vigil.');
      }
      next = { phase: 'resting' };
    }

    useWorldStore.getState().updateSimInstance(instance.id, { agentState: next });
  };
}

function maybeEmitSense(
  pair: { id: string; lastSenseAt: number; strength: number },
  message: string,
): void {
  const now = Date.now();
  if (now - pair.lastSenseAt < SENSE_COOLDOWN_MS) return;
  if (Math.random() > pair.strength * 0.5 + 0.1) return;
  useWorldStore.getState().updateEntanglement(pair.id, { lastSenseAt: now });
  worldEvents.emit({ type: 'sense/trigger', message });
  worldEvents.emit({ type: 'entanglement/pulse', strength: pair.strength });
}

export function performSplit(worldId: string, blueprints: { kindId: string; x: number; z: number }[]): boolean {
  const world = useWorldStore.getState();
  if (world.entanglements.some((p) => p.astralInstanceId.startsWith('astral-'))) {
    return false;
  }

  const pairId = `pair-${Date.now()}`;
  const astralId = `astral-${Date.now()}`;

  const astralInstance: SimInstance = {
    id: astralId,
    kind: 'player-astral',
    worldId,
    layer: 'esoteric',
    controller: 'autonomous',
    entangledWith: ['player-material'],
    agentState: { phase: 'idle' },
  };

  world.addSimInstance(astralInstance);
  world.addEntanglement({
    id: pairId,
    materialInstanceId: 'player-material',
    astralInstanceId: astralId,
    sharedResonance: { ...world.resonance } as Record<string, number>,
    strength: 0.2,
    lastSenseAt: 0,
    pendingBlueprints: blueprints,
  });
  world.setWorldLayer(worldId, 'esoteric');
  world.setControlFocus('material');
  world.addJournalEntry('Quantum split', 'An astral counterpart persists in the esoteric layer.');
  worldEvents.emit({ type: 'split/created', pairId });

  simDirector.registerInstance(astralInstance, createAstralTickFn(pairId));

  return true;
}

export function rejoinSplit(pairId: string): void {
  const world = useWorldStore.getState();
  const pair = world.entanglements.find((p) => p.id === pairId);
  if (!pair) return;

  simDirector.unregisterInstance(pair.astralInstanceId);
  world.removeSimInstance(pair.astralInstanceId);
  world.removeEntanglement(pairId);
  worldEvents.emit({ type: 'split/rejoined', pairId });
}
