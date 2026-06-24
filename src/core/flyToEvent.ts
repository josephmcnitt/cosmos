import { getEventById } from '../data/history/index';
import type { TimelineEvent } from '../data/history/types';
import { clampSpatialExponent } from './ScaleSpace';
import { useHistoryStore } from './HistoryState';
import { useObserverStore } from './ObserverState';
import { simulationClock } from './SimulationClock';

const TIME_DURATION_MS = 1200;
const SPATIAL_DURATION_MS = 1500;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateValue(
  from: number,
  to: number,
  durationMs: number,
  ease: (t: number) => number,
  onUpdate: (value: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      onUpdate(from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

export async function flyToEvent(event: TimelineEvent): Promise<void> {
  const history = useHistoryStore.getState();
  const observer = useObserverStore.getState();

  if (history.isFlying) return;

  observer.exitEmbodied();
  history.setFlying(true);
  history.selectEvent(event.id, event.track);
  history.setHistoryTrack(event.track);
  observer.setPlaybackRate(0);

  const startTime = observer.simTimeSeconds;
  const startSpatial = observer.spatialExponent;
  const targetTime = event.simTimeSeconds;
  const targetSpatial = event.spatialExponent;

  const timePromise = animateValue(
    startTime,
    targetTime,
    TIME_DURATION_MS,
    easeOutCubic,
    (v) => {
      useObserverStore.setState({
        simTimeSeconds: simulationClock.scrubTo(v),
      });
    },
  );

  const spatialPromise =
    targetSpatial !== undefined
      ? animateValue(
          startSpatial,
          targetSpatial,
          SPATIAL_DURATION_MS,
          easeInOutCubic,
          (v) => {
            useObserverStore.setState({ spatialExponent: clampSpatialExponent(v) });
          },
        )
      : Promise.resolve();

  await Promise.all([timePromise, spatialPromise]);
  useHistoryStore.getState().setFlying(false);
}

export function flyToEventById(id: string): Promise<void> {
  const event = getEventById(id);
  if (!event) return Promise.resolve();
  return flyToEvent(event);
}
