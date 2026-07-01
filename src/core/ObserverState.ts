import { Vector3 } from 'three';
import { create } from 'zustand';
import {
  EMBODIED_CAMERA_DEFAULT,
  EMBODIED_CAMERA_MAX,
  EMBODIED_CAMERA_MIN,
  EMBODIED_ENTER_EXPONENT,
  getEmbodimentContext,
  prepareEmbodiedDiscovery,
  resetEmbodiedPractice,
  shouldEnterEmbodied,
  shouldExitEmbodiedFromSpatial,
  shouldExitEmbodiedFromTime,
  spatialExponentAfterExitEmbodied,
} from './embodiment';
import {
  clampSimTimeToSpatialBand,
  computeEffectiveTimeWindow,
  computeSpatialTimeWindow,
  HUMAN_ERA_MAX_SECONDS,
  HUMAN_ERA_MIN_SECONDS,
  isEffectiveWindowNarrowed,
  isInHumanEra,
  isHumanSpatialBand,
  recomputeTimeViewBounds,
  simTimeFromWindowNormalized,
  normalizedFromSimTimeWindow,
  translateTimeViewBounds,
} from './spatialTimeCoupling';
import { clampSpatialExponent, getDominantSpatialBand, getSpatialBand } from './ScaleSpace';
import {
  clampSimTime,
  clampTemporalExponent,
  getTemporalBand,
  simTimeFromNormalizedFull,
  normalizedFromSimTimeFull,
  TEMPORAL_MAX,
  UNIVERSE_AGE_SECONDS,
} from './TimeSpace';
import { simulationClock } from './SimulationClock';
import { isEarthGlobeEnabled, isEarthAutoEnterEnabled } from './earth/feature';
import {
  clampEarthOrbitDistance,
  earthEnterPatch,
  earthExitPatch,
  shouldEnterEarthMode,
  shouldExitEarthMode,
  type EarthPhase,
  type GeoFocus,
  type EarthRotation,
  EARTH_GLOBE_EXIT_EXPONENT,
  EARTH_ORBIT_DISTANCE_DEFAULT,
} from './earth/earthMode';
import { getEarthDescentEligibility } from './earth/descent';
import { useWorldStore } from './world/WorldState';

export type ObserverMode = 'cosmic' | 'earth' | 'embodied';
export type { EarthPhase, GeoFocus, EarthRotation };

export interface ObserverState {
  spatialExponent: number;
  focusPoint: Vector3;
  temporalExponent: number;
  simTimeSeconds: number;
  /** Fixed log bounds for narrowed time window; null when zoomed out. */
  timeViewMinLog: number | null;
  timeViewMaxLog: number | null;
  playbackRate: number;
  mode: ObserverMode;
  showDebugGrid: boolean;
  avatarPosition: Vector3;
  avatarYaw: number;
  cameraDistance: number;
  preEmbodimentExponent: number;
  embodimentTransition: 'none' | 'entering' | 'exiting';
  earthPhase: EarthPhase;
  geoFocus: GeoFocus | null;
  earthRotation: EarthRotation;
  preEarthExponent: number;
  earthOrbitDistance: number;
}

export interface ObserverActions {
  setSpatialExponent: (exponent: number) => void;
  adjustSpatialExponent: (delta: number) => void;
  setTemporalExponent: (exponent: number) => void;
  adjustTemporalExponent: (delta: number) => void;
  panTimeViewAnchor: (deltaLog: number) => void;
  setSimTime: (seconds: number) => void;
  scrubNormalized: (normalized: number, anchorSimTime?: number) => void;
  setPlaybackRate: (rate: number) => void;
  togglePlayback: () => void;
  tick: (nowMs?: number) => void;
  toggleDebugGrid: () => void;
  goToHumanEra: () => void;
  enterEmbodied: () => void;
  exitEmbodied: () => void;
  setAvatarYaw: (yaw: number) => void;
  moveAvatar: (delta: Vector3) => void;
  adjustCameraDistance: (delta: number) => void;
  syncEmbodiment: () => void;
  getSpatialBandLabel: () => string;
  getTemporalBandLabel: () => string;
  getScrubberNormalized: () => number;
  getEffectiveTimeWindow: () => ReturnType<typeof computeEffectiveTimeWindow>;
  enterEarthMode: () => void;
  exitEarthMode: () => void;
  beginEarthDescent: () => boolean;
  completeEarthDescent: () => void;
  setGeoFocus: (focus: GeoFocus | null) => void;
  clearGeoFocus: () => void;
  setEarthRotation: (yaw: number, pitch: number) => void;
  adjustEarthOrbitDistance: (delta: number) => void;
}

const DEFAULT_FOCUS = new Vector3(0, 0, 0);
const DEFAULT_AVATAR = new Vector3(0, 0, 0);

function clampTimeForObserver(state: ObserverState, seconds: number): number {
  if (state.mode === 'earth') {
    return clampSimTime(
      Math.max(HUMAN_ERA_MIN_SECONDS, Math.min(HUMAN_ERA_MAX_SECONDS, seconds)),
    );
  }
  return clampSimTimeToSpatialBand(seconds, state.spatialExponent);
}

function applySpatialTimeCoupling(
  spatialExponent: number,
  simTimeSeconds: number,
  temporalExponent: number,
  snapToHumanEra = false,
): Partial<ObserverState> {
  const clampedSpatial = clampSpatialExponent(spatialExponent);
  let clampedTime = clampSimTimeToSpatialBand(simTimeSeconds, clampedSpatial);

  if (
    (snapToHumanEra || isHumanSpatialBand(clampedSpatial)) &&
    !isInHumanEra(clampedTime)
  ) {
    clampedTime = UNIVERSE_AGE_SECONDS;
  }

  const coupledTemporal =
    snapToHumanEra && isHumanSpatialBand(clampedSpatial)
      ? Math.min(temporalExponent, TEMPORAL_MAX * 0.25)
      : Math.max(0, Math.min(temporalExponent, TEMPORAL_MAX));

  return {
    spatialExponent: clampedSpatial,
    simTimeSeconds: clampedTime,
    temporalExponent: coupledTemporal,
  };
}

function applyEmbodimentAfterUpdate(
  state: ObserverState,
  partial: Partial<ObserverState>,
): Partial<ObserverState> {
  const merged = { ...state, ...partial };
  const ctx = getEmbodimentContext();

  if (shouldExitEmbodiedFromTime(merged) || shouldExitEmbodiedFromSpatial(merged)) {
    if (merged.mode === 'embodied') {
      resetEmbodiedPractice();
      return {
        ...partial,
        mode: 'cosmic',
        spatialExponent: spatialExponentAfterExitEmbodied(merged.preEmbodimentExponent),
        embodimentTransition: 'exiting',
      };
    }
  }

  if (shouldEnterEmbodied(merged, ctx)) {
    if (merged.mode === 'cosmic') {
      prepareEmbodiedDiscovery();
      return {
        ...partial,
        mode: 'embodied',
        preEmbodimentExponent: merged.spatialExponent,
        spatialExponent: EMBODIED_ENTER_EXPONENT,
        cameraDistance: EMBODIED_CAMERA_DEFAULT,
        embodimentTransition: 'entering',
      };
    }
  }

  return partial;
}

function buildEarthEnterPatch(state: ObserverState): Partial<ObserverState> {
  const patch = earthEnterPatch({ spatialExponent: state.spatialExponent });
  let simTimeSeconds = state.simTimeSeconds;
  let temporalExponent = state.temporalExponent;
  if (!isInHumanEra(simTimeSeconds)) {
    simTimeSeconds = simulationClock.scrubTo(UNIVERSE_AGE_SECONDS);
    temporalExponent = Math.min(temporalExponent, TEMPORAL_MAX * 0.25);
  }
  return { ...patch, simTimeSeconds, temporalExponent };
}

function applySpatialWithEarth(
  state: ObserverState,
  nextExponent: number,
  snapToHumanEra: boolean,
): Partial<ObserverState> {
  const featureOn = isEarthAutoEnterEnabled();

  if (shouldExitEarthMode(state, nextExponent, isEarthGlobeEnabled())) {
    return {
      ...earthExitPatch(state),
      spatialExponent: nextExponent,
    };
  }

  if (shouldEnterEarthMode(state, nextExponent, featureOn)) {
    return buildEarthEnterPatch(state);
  }

  const coupled = applySpatialTimeCoupling(
    nextExponent,
    state.simTimeSeconds,
    state.temporalExponent,
    snapToHumanEra,
  );

  if (state.mode === 'earth') {
    return {
      ...coupled,
      spatialExponent: Math.min(
        coupled.spatialExponent ?? nextExponent,
        EARTH_GLOBE_EXIT_EXPONENT,
      ),
    };
  }

  return coupled;
}

function resolveTimeViewBounds(
  state: Pick<
    ObserverState,
    'spatialExponent' | 'simTimeSeconds' | 'temporalExponent' | 'timeViewMinLog' | 'timeViewMaxLog'
  >,
  nextTemporal: number,
): { viewMinLog: number | null; viewMaxLog: number | null } {
  const priorWindow =
    state.timeViewMinLog != null && state.timeViewMaxLog != null
      ? computeEffectiveTimeWindow(
          state.spatialExponent,
          state.simTimeSeconds,
          state.temporalExponent,
          { viewMinLog: state.timeViewMinLog, viewMaxLog: state.timeViewMaxLog },
        )
      : computeEffectiveTimeWindow(
          state.spatialExponent,
          state.simTimeSeconds,
          state.temporalExponent,
        );

  const bounds = recomputeTimeViewBounds(
    state.spatialExponent,
    state.simTimeSeconds,
    nextTemporal,
    priorWindow,
  );

  if (!bounds) return { viewMinLog: null, viewMaxLog: null };
  return { viewMinLog: bounds.viewMinLog, viewMaxLog: bounds.viewMaxLog };
}

function timeWindowOptions(
  state: Pick<ObserverState, 'timeViewMinLog' | 'timeViewMaxLog'>,
) {
  if (state.timeViewMinLog != null && state.timeViewMaxLog != null) {
    return { viewMinLog: state.timeViewMinLog, viewMaxLog: state.timeViewMaxLog };
  }
  return undefined;
}

export const useObserverStore = create<ObserverState & ObserverActions>((set, get) => ({
  spatialExponent: 24,
  focusPoint: DEFAULT_FOCUS.clone(),
  temporalExponent: 0,
  simTimeSeconds: UNIVERSE_AGE_SECONDS,
  timeViewMinLog: null,
  timeViewMaxLog: null,
  playbackRate: 0,
  mode: 'cosmic',
  showDebugGrid: false,
  avatarPosition: DEFAULT_AVATAR.clone(),
  avatarYaw: 0,
  cameraDistance: EMBODIED_CAMERA_DEFAULT,
  preEmbodimentExponent: 24,
  embodimentTransition: 'none',
  earthPhase: 'globe',
  geoFocus: null,
  earthRotation: { yaw: 0, pitch: 0.35 },
  preEarthExponent: 24,
  earthOrbitDistance: EARTH_ORBIT_DISTANCE_DEFAULT,

  setSpatialExponent: (exponent) => {
    const state = get();
    const wasHuman = isHumanSpatialBand(state.spatialExponent);
    const enteringHuman = isHumanSpatialBand(exponent) && !wasHuman;
    const coupled = applySpatialWithEarth(state, exponent, enteringHuman);
    set(applyEmbodimentAfterUpdate(state, coupled));
  },

  adjustSpatialExponent: (delta) => {
    const state = get();
    const wasHuman = isHumanSpatialBand(state.spatialExponent);
    const next = state.spatialExponent + delta;
    const enteringHuman = isHumanSpatialBand(next) && !wasHuman;
    const coupled = applySpatialWithEarth(state, next, enteringHuman);
    set(applyEmbodimentAfterUpdate(state, coupled));
  },

  setTemporalExponent: (exponent) => {
    const state = get();
    const next = clampTemporalExponent(exponent);
    const bounds = resolveTimeViewBounds(state, next);
    set({
      temporalExponent: next,
      timeViewMinLog: bounds.viewMinLog,
      timeViewMaxLog: bounds.viewMaxLog,
    });
  },

  adjustTemporalExponent: (delta) => {
    const state = get();
    const next = clampTemporalExponent(state.temporalExponent + delta);
    const bounds = resolveTimeViewBounds(state, next);
    set({
      temporalExponent: next,
      timeViewMinLog: bounds.viewMinLog,
      timeViewMaxLog: bounds.viewMaxLog,
    });
  },

  panTimeViewAnchor: (deltaLog) => {
    const state = get();
    if (state.timeViewMinLog == null || state.timeViewMaxLog == null) return;

    const bandWindow = computeSpatialTimeWindow(state.spatialExponent);
    const window = computeEffectiveTimeWindow(
      state.spatialExponent,
      state.simTimeSeconds,
      state.temporalExponent,
      timeWindowOptions(state),
    );
    if (!isEffectiveWindowNarrowed(window)) return;

    const next = translateTimeViewBounds(
      state.timeViewMinLog,
      state.timeViewMaxLog,
      deltaLog,
      bandWindow,
    );
    set({ timeViewMinLog: next.viewMinLog, timeViewMaxLog: next.viewMaxLog });
  },

  setSimTime: (seconds) => {
    const state = get();
    const clamped = clampTimeForObserver(state, seconds);
    const partial = { simTimeSeconds: simulationClock.scrubTo(clamped) };
    set(applyEmbodimentAfterUpdate(state, partial));
  },

  scrubNormalized: (normalized, anchorSimTime) => {
    const state = get();
    let seconds: number;
    if (state.mode === 'earth') {
      seconds = simTimeFromNormalizedFull(normalized);
    } else {
      const hasStoredBounds =
        state.timeViewMinLog != null && state.timeViewMaxLog != null;
      const window = computeEffectiveTimeWindow(
        state.spatialExponent,
        hasStoredBounds ? state.simTimeSeconds : (anchorSimTime ?? state.simTimeSeconds),
        state.temporalExponent,
        timeWindowOptions(state),
      );
      seconds = simTimeFromWindowNormalized(normalized, window);
    }
    const clamped = clampTimeForObserver(state, seconds);
    const partial = { simTimeSeconds: simulationClock.scrubTo(clamped) };
    set(applyEmbodimentAfterUpdate(state, partial));
  },

  setPlaybackRate: (rate) => set({ playbackRate: Math.max(0, rate) }),

  togglePlayback: () =>
    set((s) => ({
      playbackRate: s.playbackRate === 0 ? 1 : 0,
    })),

  tick: (nowMs) => {
    const { simTimeSeconds, playbackRate, spatialExponent, mode } = get();
    if (playbackRate === 0) return;
    const result = simulationClock.tick(simTimeSeconds, playbackRate, nowMs);
    const clamped = clampSimTimeToSpatialBand(result.simTimeSeconds, spatialExponent);
    const state = get();
    const partial = { simTimeSeconds: clamped };
    if (mode === 'embodied') {
      set(applyEmbodimentAfterUpdate(state, partial));
    } else {
      set(partial);
    }
  },

  toggleDebugGrid: () => set((s) => ({ showDebugGrid: !s.showDebugGrid })),

  goToHumanEra: () => {
    const { spatialExponent, temporalExponent } = get();
    set({
      simTimeSeconds: simulationClock.scrubTo(UNIVERSE_AGE_SECONDS),
      temporalExponent: isHumanSpatialBand(spatialExponent)
        ? Math.min(temporalExponent, TEMPORAL_MAX * 0.25)
        : temporalExponent,
    });
  },

  enterEmbodied: () => {
    const state = get();
    if (state.mode === 'embodied') return;
    prepareEmbodiedDiscovery();
    set({
      mode: 'embodied',
      preEmbodimentExponent: state.spatialExponent,
      spatialExponent: EMBODIED_ENTER_EXPONENT,
      cameraDistance: EMBODIED_CAMERA_DEFAULT,
      embodimentTransition: 'entering',
    });
  },

  exitEmbodied: () => {
    const state = get();
    if (state.mode !== 'embodied') return;
    resetEmbodiedPractice();
    set({
      mode: 'cosmic',
      spatialExponent: spatialExponentAfterExitEmbodied(state.preEmbodimentExponent),
      embodimentTransition: 'exiting',
    });
  },

  setAvatarYaw: (yaw) => set({ avatarYaw: yaw }),

  moveAvatar: (delta) =>
    set((s) => {
      const next = s.avatarPosition.clone().add(delta);
      return { avatarPosition: next };
    }),

  adjustCameraDistance: (delta) => {
    const state = get();
    const next = Math.max(
      EMBODIED_CAMERA_MIN,
      Math.min(EMBODIED_CAMERA_MAX, state.cameraDistance + delta),
    );
    if (next >= EMBODIED_CAMERA_MAX && delta > 0) {
      get().exitEmbodied();
      return;
    }
    set({ cameraDistance: next });
  },

  syncEmbodiment: () => {
    const state = get();
    const ctx = getEmbodimentContext();
    if (shouldEnterEmbodied(state, ctx)) {
      get().enterEmbodied();
    } else if (
      shouldExitEmbodiedFromTime(state) ||
      shouldExitEmbodiedFromSpatial(state)
    ) {
      get().exitEmbodied();
    }
  },

  getSpatialBandLabel: () => getSpatialBand(get().spatialExponent).label,

  getTemporalBandLabel: () => getTemporalBand(get().simTimeSeconds).label,

  getScrubberNormalized: () => {
    const state = get();
    if (state.mode === 'earth') {
      return normalizedFromSimTimeFull(state.simTimeSeconds);
    }
    const window = computeEffectiveTimeWindow(
      state.spatialExponent,
      state.simTimeSeconds,
      state.temporalExponent,
      timeWindowOptions(state),
    );
    return normalizedFromSimTimeWindow(state.simTimeSeconds, window);
  },

  getEffectiveTimeWindow: () => {
    const state = get();
    return computeEffectiveTimeWindow(
      state.spatialExponent,
      state.simTimeSeconds,
      state.temporalExponent,
      timeWindowOptions(state),
    );
  },

  enterEarthMode: () => {
    if (!isEarthGlobeEnabled()) return;
    const state = get();
    if (state.mode === 'earth') return;
    set(buildEarthEnterPatch(state));
  },

  exitEarthMode: () => {
    const state = get();
    if (state.mode !== 'earth') return;
    set({ ...earthExitPatch(state), earthPhase: 'globe' });
  },

  beginEarthDescent: () => {
    const state = get();
    if (state.mode !== 'earth' || state.earthPhase !== 'globe') return false;

    const eligibility = getEarthDescentEligibility(state.geoFocus, state.simTimeSeconds);
    if (!eligibility.canDescend || !state.geoFocus?.ageId) return false;

    const ageId = state.geoFocus.ageId;
    if (!useWorldStore.getState().travelToWorld(ageId)) return false;

    prepareEmbodiedDiscovery(true);
    set({ earthPhase: 'descent', embodimentTransition: 'entering' });
    return true;
  },

  completeEarthDescent: () => {
    const state = get();
    if (state.mode !== 'earth' || state.earthPhase !== 'descent') return;

    set({
      mode: 'embodied',
      earthPhase: 'globe',
      geoFocus: null,
      spatialExponent: EMBODIED_ENTER_EXPONENT,
      preEmbodimentExponent: state.preEarthExponent,
      cameraDistance: EMBODIED_CAMERA_DEFAULT,
      embodimentTransition: 'entering',
    });
  },

  setGeoFocus: (focus) => set({ geoFocus: focus }),

  clearGeoFocus: () => set({ geoFocus: null }),

  setEarthRotation: (yaw, pitch) =>
    set({
      earthRotation: {
        yaw,
        pitch: Math.max(-1.2, Math.min(1.2, pitch)),
      },
    }),

  adjustEarthOrbitDistance: (delta) =>
    set((s) => ({
      earthOrbitDistance: clampEarthOrbitDistance(s.earthOrbitDistance + delta * 12),
    })),
}));

export function hasEpochMismatch(state: ObserverState): boolean {
  const spatial = getDominantSpatialBand(state.spatialExponent);
  const temporal = getTemporalBand(state.simTimeSeconds);
  return spatial.id === 'human' && temporal.id !== 'human';
}

export function getInitialObserverState(): ObserverState {
  return {
    spatialExponent: 24,
    focusPoint: DEFAULT_FOCUS.clone(),
    temporalExponent: 0,
    simTimeSeconds: clampSimTime(UNIVERSE_AGE_SECONDS),
    timeViewMinLog: null,
    timeViewMaxLog: null,
    playbackRate: 0,
    mode: 'cosmic',
    showDebugGrid: false,
    avatarPosition: DEFAULT_AVATAR.clone(),
    avatarYaw: 0,
    cameraDistance: EMBODIED_CAMERA_DEFAULT,
    preEmbodimentExponent: 24,
    embodimentTransition: 'none',
    earthPhase: 'globe',
    geoFocus: null,
    earthRotation: { yaw: 0, pitch: 0.35 },
    preEarthExponent: 24,
    earthOrbitDistance: EARTH_ORBIT_DISTANCE_DEFAULT,
  };
}
