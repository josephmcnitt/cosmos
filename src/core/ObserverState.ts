import { Vector3 } from 'three';
import { create } from 'zustand';
import {
  EMBODIED_CAMERA_DEFAULT,
  EMBODIED_CAMERA_MAX,
  EMBODIED_CAMERA_MIN,
  EMBODIED_ENTER_EXPONENT,
  getEmbodimentContext,
  prepareEmbodiedDiscovery,
  shouldEnterEmbodied,
  shouldExitEmbodiedFromSpatial,
  shouldExitEmbodiedFromTime,
} from './embodiment';
import {
  clampSimTimeToSpatialBand,
  computeEffectiveTimeWindow,
  isInHumanEra,
  isHumanSpatialBand,
  simTimeFromWindowNormalized,
  normalizedFromSimTimeWindow,
} from './spatialTimeCoupling';
import { clampSpatialExponent, getDominantSpatialBand, getSpatialBand } from './ScaleSpace';
import {
  clampSimTime,
  clampTemporalExponent,
  getTemporalBand,
  TEMPORAL_MAX,
  UNIVERSE_AGE_SECONDS,
} from './TimeSpace';
import { simulationClock } from './SimulationClock';

export type ObserverMode = 'cosmic' | 'embodied';

export interface ObserverState {
  spatialExponent: number;
  focusPoint: Vector3;
  temporalExponent: number;
  simTimeSeconds: number;
  playbackRate: number;
  mode: ObserverMode;
  showDebugGrid: boolean;
  avatarPosition: Vector3;
  avatarYaw: number;
  cameraDistance: number;
  preEmbodimentExponent: number;
  embodimentTransition: 'none' | 'entering' | 'exiting';
  // Phase 5: spiritualDepth: number;  // 0–1, drives realm rendering
  // Phase 5: resonance: Record<string, number>;
}

export interface ObserverActions {
  setSpatialExponent: (exponent: number) => void;
  adjustSpatialExponent: (delta: number) => void;
  setTemporalExponent: (exponent: number) => void;
  adjustTemporalExponent: (delta: number) => void;
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
}

const DEFAULT_FOCUS = new Vector3(0, 0, 0);
const DEFAULT_AVATAR = new Vector3(0, 0, 0);

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
      return {
        ...partial,
        mode: 'cosmic',
        spatialExponent: merged.preEmbodimentExponent,
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

export const useObserverStore = create<ObserverState & ObserverActions>((set, get) => ({
  spatialExponent: 24,
  focusPoint: DEFAULT_FOCUS.clone(),
  temporalExponent: 0,
  simTimeSeconds: UNIVERSE_AGE_SECONDS,
  playbackRate: 0,
  mode: 'cosmic',
  showDebugGrid: false,
  avatarPosition: DEFAULT_AVATAR.clone(),
  avatarYaw: 0,
  cameraDistance: EMBODIED_CAMERA_DEFAULT,
  preEmbodimentExponent: 24,
  embodimentTransition: 'none',

  setSpatialExponent: (exponent) => {
    const state = get();
    const wasHuman = isHumanSpatialBand(state.spatialExponent);
    const enteringHuman = isHumanSpatialBand(exponent) && !wasHuman;
    const coupled = applySpatialTimeCoupling(
      exponent,
      state.simTimeSeconds,
      state.temporalExponent,
      enteringHuman,
    );
    set(applyEmbodimentAfterUpdate(state, coupled));
  },

  adjustSpatialExponent: (delta) => {
    const state = get();
    const wasHuman = isHumanSpatialBand(state.spatialExponent);
    const next = state.spatialExponent + delta;
    const enteringHuman = isHumanSpatialBand(next) && !wasHuman;
    const coupled = applySpatialTimeCoupling(
      next,
      state.simTimeSeconds,
      state.temporalExponent,
      enteringHuman,
    );
    set(applyEmbodimentAfterUpdate(state, coupled));
  },

  setTemporalExponent: (exponent) =>
    set({ temporalExponent: clampTemporalExponent(exponent) }),

  adjustTemporalExponent: (delta) =>
    set((s) => ({
      temporalExponent: clampTemporalExponent(s.temporalExponent + delta),
    })),

  setSimTime: (seconds) => {
    const state = get();
    const clamped = clampSimTimeToSpatialBand(seconds, state.spatialExponent);
    const partial = { simTimeSeconds: simulationClock.scrubTo(clamped) };
    set(applyEmbodimentAfterUpdate(state, partial));
  },

  scrubNormalized: (normalized, anchorSimTime) => {
    const state = get();
    const anchor = anchorSimTime ?? state.simTimeSeconds;
    const window = computeEffectiveTimeWindow(
      state.spatialExponent,
      anchor,
      state.temporalExponent,
    );
    const seconds = simTimeFromWindowNormalized(normalized, window);
    const partial = { simTimeSeconds: simulationClock.scrubTo(seconds) };
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
    set({
      mode: 'cosmic',
      spatialExponent: state.preEmbodimentExponent,
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
    const { simTimeSeconds, spatialExponent, temporalExponent } = get();
    const window = computeEffectiveTimeWindow(
      spatialExponent,
      simTimeSeconds,
      temporalExponent,
    );
    return normalizedFromSimTimeWindow(simTimeSeconds, window);
  },

  getEffectiveTimeWindow: () => {
    const { spatialExponent, simTimeSeconds, temporalExponent } = get();
    return computeEffectiveTimeWindow(
      spatialExponent,
      simTimeSeconds,
      temporalExponent,
    );
  },
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
    playbackRate: 0,
    mode: 'cosmic',
    showDebugGrid: false,
    avatarPosition: DEFAULT_AVATAR.clone(),
    avatarYaw: 0,
    cameraDistance: EMBODIED_CAMERA_DEFAULT,
    preEmbodimentExponent: 24,
    embodimentTransition: 'none',
  };
}
