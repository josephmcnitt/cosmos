import { useEffect, useRef, useState } from 'react';
import { ceYear } from '../data/history/time';
import { getPuzzleById } from '../data/ages/index';
import {
  checkEraWitness,
  checkRingAlignment,
  checkThresholdStance,
  puzzleActionHint,
  puzzleHintFor,
  rotateRing,
} from '../core/puzzles/index';
import { useObserverStore } from '../core/ObserverState';
import { usePracticeStore } from '../core/PracticeState';
import { useWorldStore } from '../core/world/WorldState';
import { useIntroActive } from '../core/IntroSkipHandler';
import { getNearestSiteMarker } from '../data/embodied/siteMarkers';
import { getNearestPuzzleMechanism } from '../core/world/worldQueries';

export function AgeInteractionControls() {
  const introActive = useIntroActive();
  const mode = useObserverStore((s) => s.mode);
  const avatarPosition = useObserverStore((s) => s.avatarPosition);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const realmPhase = usePracticeStore((s) => s.realmPhase);
  const sustainElapsedSec = usePracticeStore((s) => s.sustainElapsedSec);
  const spiritualDepth = useWorldStore((s) => s.spiritualDepth);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const isAgeInitiated = useWorldStore((s) => s.isAgeInitiated(currentWorldId));
  const entities = useWorldStore((s) => s.entities);
  const completePuzzle = useWorldStore((s) => s.completePuzzle);
  const isPuzzleCompleted = useWorldStore((s) => s.isPuzzleCompleted);
  const updateEntity = useWorldStore((s) => s.updateEntity);
  const markEraWitnessed = useWorldStore((s) => s.markEraWitnessed);
  const eraWitnessFlags = useWorldStore((s) => s.eraWitnessFlags);
  const [hint, setHint] = useState<string | null>(null);
  const stanceStart = useRef<number | null>(null);
  const ringIndex = useRef(0);

  useEffect(() => {
    if (mode !== 'embodied' || introActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isAgeInitiated) return;
      if (e.key.toLowerCase() === 'r') {
        let puzzleEntity = getNearestPuzzleMechanism(avatarPosition.x, avatarPosition.z, {
          type: 'ring-alignment',
          maxDistance: 5,
        });
        if (!puzzleEntity) {
          const marker = getNearestSiteMarker(avatarPosition.x, avatarPosition.z, 5);
          if (!marker) {
            setHint('No puzzle stone nearby — walk to the teal Hermetic Corpus stone on the south-west path.');
            return;
          }
          puzzleEntity = entities.find(
            (ent) =>
              ent.worldId === currentWorldId &&
              ent.kind === 'puzzle-mechanism' &&
              getPuzzleById(ent.defId)?.markerEventId === marker.eventId,
          );
          if (!puzzleEntity) {
            setHint(
              `This is ${marker.label} — walk to the Hermetic Corpus stone for the ring puzzle, or press E here.`,
            );
            return;
          }
        }
        const template = getPuzzleById(puzzleEntity.defId);
        if (template?.type !== 'ring-alignment') {
          setHint(puzzleActionHint(puzzleEntity.defId));
          return;
        }

        const rotations = rotateRing(
          (puzzleEntity.state.ringRotations as number[]) ?? [0, 0, 0],
          ringIndex.current % 3,
        );
        ringIndex.current += 1;
        updateEntity(puzzleEntity.id, (ent) => ({
          ...ent,
          state: { ...ent.state, ringRotations: rotations },
        }));

        if (checkRingAlignment(puzzleEntity.defId, rotations)) {
          completePuzzle(puzzleEntity.defId);
          setHint(null);
        } else {
          setHint(puzzleHintFor(puzzleEntity.defId));
        }
      }

      if (e.key.toLowerCase() === 'tab') {
        e.preventDefault();
        if (!isAgeInitiated) return;
        const layer = useWorldStore.getState().getWorldLayer(currentWorldId);
        if (spiritualDepth >= 0.35 || layer === 'esoteric') {
          useWorldStore
            .getState()
            .setWorldLayer(currentWorldId, layer === 'material' ? 'esoteric' : 'material');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    mode,
    introActive,
    avatarPosition.x,
    avatarPosition.z,
    entities,
    currentWorldId,
    completePuzzle,
    updateEntity,
    spiritualDepth,
    isAgeInitiated,
  ]);

  useEffect(() => {
    if (mode !== 'embodied' || !isAgeInitiated) return;
    const marker = getNearestSiteMarker(avatarPosition.x, avatarPosition.z, 5);
    if (!marker) {
      stanceStart.current = null;
      return;
    }
    const puzzleEntity = entities.find(
      (ent) =>
        ent.worldId === currentWorldId &&
        ent.kind === 'puzzle-mechanism' &&
        getPuzzleById(ent.defId)?.type === 'threshold-stance' &&
        getPuzzleById(ent.defId)?.markerEventId === marker.eventId,
    );
    if (!puzzleEntity || realmPhase !== 'liminal') {
      stanceStart.current = null;
      return;
    }
    if (stanceStart.current === null) stanceStart.current = performance.now();
    const holdSec = (performance.now() - stanceStart.current) / 1000;
    if (
      !isPuzzleCompleted(puzzleEntity.defId) &&
      checkThresholdStance(
        puzzleEntity.defId,
        avatarPosition.x,
        avatarPosition.z,
        marker.position[0],
        marker.position[1],
        holdSec,
      )
    ) {
      completePuzzle(puzzleEntity.defId);
    }
  }, [
    mode,
    avatarPosition.x,
    avatarPosition.z,
    realmPhase,
    sustainElapsedSec,
    entities,
    currentWorldId,
    completePuzzle,
    isPuzzleCompleted,
  ]);

  useEffect(() => {
    const christianityTime = ceYear(30);
    if (mode === 'cosmic' && Math.abs(simTimeSeconds - christianityTime) < 5e10) {
      markEraWitnessed('christianity');
    }
    if (
      checkEraWitness('puzzle-gnostic-era', eraWitnessFlags) &&
      !isPuzzleCompleted('puzzle-gnostic-era')
    ) {
      completePuzzle('puzzle-gnostic-era');
    }
  }, [mode, simTimeSeconds, eraWitnessFlags, markEraWitnessed, completePuzzle, isPuzzleCompleted]);

  if (!hint) return null;
  return (
    <div className="puzzle-hint ui-panel" data-testid="puzzle-hint">
      {hint}
    </div>
  );
}
