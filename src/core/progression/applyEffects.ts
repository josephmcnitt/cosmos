import { getProgressNodeById } from '../../data/progression/index';
import type { ProgressEffect } from '../../data/progression/types';
import type { EntityInstance } from '../world/types';

export interface EffectApplicationState {
  pathFlags: Record<string, string | number | boolean>;
  activePathId?: string;
  revealedMarkerIds: string[];
  unlockedWorldIds: string[];
  entities: EntityInstance[];
  journal: Array<{ id: string; title: string; body: string; at: number }>;
}

export function applyProgressEffects(
  state: EffectApplicationState,
  nodeIds: string[],
): EffectApplicationState {
  let next = { ...state, pathFlags: { ...state.pathFlags }, revealedMarkerIds: [...state.revealedMarkerIds] };

  for (const nodeId of nodeIds) {
    const node = getProgressNodeById(nodeId);
    if (!node) continue;
    for (const effect of node.effects) {
      next = applyEffect(next, effect);
    }
  }

  return next;
}

function applyEffect(state: EffectApplicationState, effect: ProgressEffect): EffectApplicationState {
  switch (effect.type) {
    case 'setPathFlag':
      return {
        ...state,
        pathFlags: { ...state.pathFlags, [effect.flag]: effect.value },
      };
    case 'setActivePath':
      return { ...state, activePathId: effect.pathId };
    case 'revealMarker': {
      const revealedMarkerIds = state.revealedMarkerIds.includes(effect.markerId)
        ? state.revealedMarkerIds
        : [...state.revealedMarkerIds, effect.markerId];
      const entities = state.entities.map((e) => {
        if (e.id === effect.markerId && e.worldId === effect.worldId) {
          return { ...e, state: { ...e.state, progressRevealed: true } };
        }
        return e;
      });
      return { ...state, revealedMarkerIds, entities };
    }
    case 'unlockWorld': {
      const unlockedWorldIds = state.unlockedWorldIds.includes(effect.worldId)
        ? state.unlockedWorldIds
        : [...state.unlockedWorldIds, effect.worldId];
      return { ...state, unlockedWorldIds };
    }
    case 'unlockPortal': {
      const entities = state.entities.map((e) => {
        if (e.id === effect.portalId && e.kind === 'portal') {
          return { ...e, state: { ...e.state, unlocked: true } };
        }
        return e;
      });
      return { ...state, entities };
    }
    case 'journalEntry':
      return {
        ...state,
        journal: [
          ...state.journal,
          {
            id: `journal-progress-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: effect.title,
            body: effect.body,
            at: Date.now(),
          },
        ],
      };
    default:
      return state;
  }
}
