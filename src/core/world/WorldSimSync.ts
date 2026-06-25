import { simDirector } from './SimDirector';
import { createAstralTickFn } from '../astral/AstralAgent';
import { useWorldStore } from './WorldState';

/** Re-register autonomous instances after load and catch up offline time. */
export function bootstrapSimInstances(): void {
  const state = useWorldStore.getState();
  const elapsed = Date.now() - state.lastSimTickMs;

  for (const pair of state.entanglements) {
    const astral = state.simInstances.find((i) => i.id === pair.astralInstanceId);
    if (astral && astral.controller === 'autonomous') {
      simDirector.registerInstance(astral, createAstralTickFn(pair.id));
    }
  }

  if (elapsed > 1000) {
    simDirector.catchUpOnLoad(elapsed);
  }

  useWorldStore.setState({ lastSimTickMs: Date.now() });
  useWorldStore.getState().persist();
}

export function tickWorldSim(nowMs: number): void {
  simDirector.tick(nowMs);
  useWorldStore.setState({ lastSimTickMs: nowMs });
}
