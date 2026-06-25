type Unsubscribe = () => void;

class WorldEventsBus {
  private handlers = new Set<WorldEventHandler>();

  subscribe(handler: WorldEventHandler): Unsubscribe {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(event: WorldEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const worldEvents = new WorldEventsBus();

export type WorldEvent =
  | { type: 'entity/discovered'; entityId: string; eventId: string }
  | { type: 'structure/completed'; entityId: string; worldId: string }
  | { type: 'sense/trigger'; message: string; tradition?: string }
  | { type: 'entanglement/pulse'; strength: number }
  | { type: 'portal/unlocked'; portalId: string; targetAgeId: string }
  | { type: 'puzzle/completed'; puzzleId: string }
  | { type: 'split/created'; pairId: string }
  | { type: 'split/rejoined'; pairId: string }
  | { type: 'world/traveled'; fromWorldId: string; toWorldId: string };

export type WorldEventHandler = (event: WorldEvent) => void;
