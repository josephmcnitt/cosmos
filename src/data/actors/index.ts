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
  {
    id: 'byzantium-scribe',
    label: 'Scriptorium monk',
    displayName: 'Monk of the scriptorium',
    tradition: 'neoplatonism',
    worldId: 'byzantium',
    position: [0, 2],
    yaw: Math.PI,
    robeColor: '#d4c4a8',
    initiationId: 'initiation-byzantium',
  },
  {
    id: 'cordoba-translator',
    label: 'Master translator',
    displayName: 'Master translator',
    tradition: 'hermetic',
    worldId: 'cordoba',
    position: [0, 2],
    yaw: 0,
    robeColor: '#c9a227',
    initiationId: 'initiation-cordoba',
  },
  {
    id: 'safed-disciple',
    label: 'Disciple of the Ari',
    displayName: 'Disciple of the Ari',
    tradition: 'kabbalah',
    worldId: 'safed',
    position: [0, 4],
    yaw: Math.PI,
    robeColor: '#d4a843',
    initiationId: 'initiation-safed',
  },
  {
    id: 'cologne-scribe',
    label: 'The magister\'s scribe',
    displayName: 'The Magister\'s Scribe',
    tradition: 'hermetic',
    worldId: 'cologne',
    position: [0, 2],
    yaw: Math.PI,
    robeColor: '#88a8f0',
    initiationId: 'initiation-cologne',
  },
];

export function getActorById(id: string): ActorDefinition | undefined {
  return ALL_ACTORS.find((a) => a.id === id);
}

export function getActorForWorld(worldId: string): ActorDefinition | undefined {
  return ALL_ACTORS.find((a) => a.worldId === worldId);
}
