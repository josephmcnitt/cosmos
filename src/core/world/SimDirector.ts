import type { SimInstance } from './types';

export type InstanceTickFn = (
  instance: SimInstance,
  dtSec: number,
  nowMs: number,
) => void;

export interface SimDirectorState {
  lastTickMs: number | null;
  lastPersistedMs: number;
}

export class SimDirector {
  private instances = new Map<string, { instance: SimInstance; tickFn: InstanceTickFn }>();
  lastTickMs: number | null = null;
  pauseWhenHidden = true;
  private hidden = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.hidden = document.hidden;
      });
    }
  }

  registerInstance(instance: SimInstance, tickFn: InstanceTickFn): void {
    this.instances.set(instance.id, { instance, tickFn });
  }

  unregisterInstance(id: string): void {
    this.instances.delete(id);
  }

  getInstance(id: string): SimInstance | undefined {
    return this.instances.get(id)?.instance;
  }

  getAllInstances(): SimInstance[] {
    return [...this.instances.values()].map((v) => v.instance);
  }

  tick(nowMs: number = performance.now()): void {
    if (this.pauseWhenHidden && this.hidden) return;

    if (this.lastTickMs === null) {
      this.lastTickMs = nowMs;
      return;
    }

    const dtSec = (nowMs - this.lastTickMs) / 1000;
    this.lastTickMs = nowMs;

    for (const { instance, tickFn } of this.instances.values()) {
      if (instance.controller === 'autonomous') {
        tickFn(instance, dtSec, nowMs);
      }
    }
  }

  catchUpOnLoad(elapsedRealMs: number, maxCatchUpSec = 3600): void {
    if (elapsedRealMs <= 0) return;
    const dtSec = Math.min(elapsedRealMs / 1000, maxCatchUpSec);
    const nowMs = performance.now();
    for (const { instance, tickFn } of this.instances.values()) {
      if (instance.controller === 'autonomous') {
        tickFn(instance, dtSec, nowMs);
      }
    }
    this.lastTickMs = nowMs;
  }

  resetClock(): void {
    this.lastTickMs = null;
  }
}

export const simDirector = new SimDirector();
