import type { ActorDefinition } from '../ages/types';

export type { ActorDefinition };

export const ALL_ACTORS: ActorDefinition[] = [
  {
    id: 'academy-guide',
    label: 'Academy guide',
    displayName: 'The Scholarch',
    tradition: 'platonism',
    worldId: 'grove',
    position: [0, 9],
    yaw: Math.PI,
    robeColor: '#e8e0d0',
    initiationId: 'initiation-grove',
  },
  {
    id: 'library-keeper',
    label: 'Library keeper',
    displayName: 'Keeper of the Serapeum',
    tradition: 'hermetic',
    worldId: 'alexandria',
    position: [0, 2],
    yaw: Math.PI,
    robeColor: '#4ecdc4',
    initiationId: 'initiation-alexandria',
  },
  {
    id: 'porphyry-disciple',
    label: 'Porphyry disciple',
    displayName: 'Disciple of Plotinus',
    tradition: 'neoplatonism',
    worldId: 'rome',
    position: [0, 2],
    yaw: 0,
    robeColor: '#c8b8e8',
    initiationId: 'initiation-rome',
  },
  {
    id: 'desert-anchorite',
    label: 'Desert anchorite',
    displayName: 'The Anchorite',
    tradition: 'gnosticism',
    worldId: 'desert',
    position: [0, 2],
    yaw: Math.PI,
    robeColor: '#b088f0',
    initiationId: 'initiation-desert',
  },
];

export function getActorById(id: string): ActorDefinition | undefined {
  return ALL_ACTORS.find((a) => a.id === id);
}

export function getActorForWorld(worldId: string): ActorDefinition | undefined {
  return ALL_ACTORS.find((a) => a.worldId === worldId);
}
