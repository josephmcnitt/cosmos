import { advanceSimTime, clampSimTime, UNIVERSE_AGE_SECONDS } from './TimeSpace';

export interface ClockTickResult {
  simTimeSeconds: number;
  deltaSimSeconds: number;
}

export class SimulationClock {
  private lastTickMs: number | null = null;

  tick(
    simTimeSeconds: number,
    playbackRate: number,
    nowMs: number = performance.now(),
  ): ClockTickResult {
    if (this.lastTickMs === null) {
      this.lastTickMs = nowMs;
      return { simTimeSeconds, deltaSimSeconds: 0 };
    }

    const deltaRealSeconds = (nowMs - this.lastTickMs) / 1000;
    this.lastTickMs = nowMs;

    const prev = simTimeSeconds;
    const next = advanceSimTime(simTimeSeconds, deltaRealSeconds, playbackRate);

    return {
      simTimeSeconds: next,
      deltaSimSeconds: next - prev,
    };
  }

  reset(): void {
    this.lastTickMs = null;
  }

  scrubTo(seconds: number): number {
    this.reset();
    return clampSimTime(seconds);
  }

  static atPresent(): number {
    return UNIVERSE_AGE_SECONDS;
  }
}

export const simulationClock = new SimulationClock();

export const PLAYBACK_PRESETS = [0, 1, 10, 100, 1000] as const;
export type PlaybackPreset = (typeof PLAYBACK_PRESETS)[number];
