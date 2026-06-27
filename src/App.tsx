import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { EmbodiedCamera } from './camera/EmbodiedCamera';
import { LogarithmicCamera } from './camera/LogarithmicCamera';
import { EmbodimentSync } from './core/EmbodimentSync';
import { PracticeSync } from './core/PracticeSync';
import { RealmTransitionSync } from './core/RealmTransitionSync';
import { WorldBootstrap } from './core/world/WorldBootstrap';
import { WorldTravelSync } from './core/world/WorldTravelSync';
import { InitiationSync } from './core/initiation/InitiationSync';
import { ProgressionSync } from './core/progression/ProgressionSync';
import { useRealmDisplayStore } from './core/RealmDisplayState';
import { fogDistances } from './core/realmTransition';
import { IntroSkipHandler, useIntroActive } from './core/IntroSkipHandler';
import { SimulationLoop } from './core/SimulationLoop';
import { useIntroStore } from './core/IntroState';
import { useHistoryStore } from './core/HistoryState';
import { useObserverStore } from './core/ObserverState';
import { SPATIAL_MAX, SPATIAL_MIN } from './core/ScaleSpace';
import { EmbodiedControls } from './input/EmbodiedControls';
import { PracticeControls } from './input/PracticeControls';
import { EmbodiedOverlay } from './ui/EmbodiedOverlay';
import { EmbodiedPrompt } from './ui/EmbodiedPrompt';
import { PracticeOverlay } from './ui/PracticeOverlay';
import { EmbodimentBanner } from './ui/EmbodimentBanner';
import { EventDetailPanel } from './ui/EventDetailPanel';
import { EventListPanel } from './ui/EventListPanel';
import { HistoryKeyboard } from './ui/HistoryKeyboard';
import { IntroOverlay } from './ui/IntroOverlay';
import { ScaleHUD, TimelineLabel } from './ui/ScaleHUD';
import { TimeControls } from './ui/TimeControls';
import { HeavenPhaseIndicator } from './ui/HeavenPhaseIndicator';
import { EphemerisIndicator } from './ui/EphemerisIndicator';
import { StarfieldIndicator } from './ui/StarfieldIndicator';
import { BigBangReplayIndicator } from './ui/BigBangReplayIndicator';
import { CorrespondenceIndicator } from './ui/CorrespondenceIndicator';
import { KnowledgeModeIndicator } from './ui/KnowledgeModeIndicator';
import { ZoomControls } from './ui/ZoomControls';
import { WalkApproachPrompt } from './ui/WalkApproachPrompt';
import { LinkPanel } from './ui/LinkPanel';
import { InitiationPanel } from './ui/InitiationPanel';
import { SenseWhisper } from './ui/SenseWhisper';
import { JournalPanel } from './ui/JournalPanel';
import { PathPanel } from './ui/PathPanel';
import { AgeInteractionControls } from './input/AgeInteractionControls';
import { NpcInteractionControls } from './input/NpcInteractionControls';
import { SplitControls } from './input/SplitControls';
import { BigBangEffect } from './world/BigBangEffect';
import { DebugGrid } from './world/DebugGrid';
import { EmbodiedSite } from './world/EmbodiedSite';
import { LiminalEffects } from './world/LiminalEffects';
import { SpiritualRealm } from './world/SpiritualRealm';
import { PlayerAvatar } from './world/PlayerAvatar';
import { HistoryMarkers } from './world/HistoryMarkers';
import { MaterialHeavens } from './world/MaterialHeavens';
import { CosmicSkySync } from './world/CosmicSkySync';
import { CosmicStarfield } from './world/CosmicStarfield';
import { EphemerisSky } from './world/EphemerisSky';
import { CorrespondenceSky } from './world/CorrespondenceSky';
import { FlightStarfield } from './world/FlightStarfield';
import { EmbodimentApproachPreview } from './world/EmbodimentApproachPreview';
import { embodimentApproachWeight } from './core/embodiment';
import { useWorldStore } from './core/world/WorldState';
import { WorldRoot } from './world/WorldRoot';
import { onRangeInputWheel } from './ui/rangeInputWheelGuard';

function Scene() {
  const introPhase = useIntroStore((s) => s.phase);
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const liminalWeight = useRealmDisplayStore((s) => s.liminalWeight);
  const spiritualWeight = useRealmDisplayStore((s) => s.spiritualWeight);
  const introComplete = introPhase === 'complete';
  const showWorld = introPhase === 'expansion' || introPhase === 'reveal' || introComplete;
  const embodied = mode === 'embodied' && showWorld;
  const approachWeight = embodimentApproachWeight(spatialExponent);
  const realmActive = liminalWeight > 0.02 || spiritualWeight > 0.02;
  const worldLayer = useWorldStore((s) => s.worldLayers[s.currentWorldId] ?? 'material');
  const fog = fogDistances(embodied, liminalWeight, spiritualWeight);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#030508', fog.near, fog.far]} />
      <ambientLight intensity={embodied ? 0.45 : 0.28} />
      {embodied ? <EmbodiedCamera /> : <LogarithmicCamera />}
      <SimulationLoop />
      <BigBangEffect />
      {embodied ? (
        <>
          <directionalLight position={[8, 16, 6]} intensity={1.1} castShadow />
          <EmbodiedSite />
          <PlayerAvatar />
          {realmActive && <LiminalEffects />}
          {(spiritualWeight > 0.02 || worldLayer === 'esoteric') && <SpiritualRealm />}
        </>
      ) : (
        <>
          <CosmicSkySync />
          <CosmicStarfield />
          <FlightStarfield />
          {introComplete ? <MaterialHeavens /> : introPhase === 'expansion' || introPhase === 'reveal' ? <WorldRoot /> : null}
          {introComplete && approachWeight > 0.02 && (
            <EmbodimentApproachPreview weight={approachWeight} />
          )}
          {introComplete && <EphemerisSky />}
          {introComplete && <CorrespondenceSky />}
          {introComplete && <HistoryMarkers />}
        </>
      )}
      <DebugGrid />
    </>
  );
}

function KeyboardShortcuts() {
  const toggleDebugGrid = useObserverStore((s) => s.toggleDebugGrid);
  const introActive = useIntroActive();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (introActive) return;
      if (e.key === '`' || e.key === '~') toggleDebugGrid();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleDebugGrid, introActive]);

  return null;
}

function SpatialSlider() {
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const setSpatialExponent = useObserverStore((s) => s.setSpatialExponent);
  const mode = useObserverStore((s) => s.mode);

  if (mode === 'embodied') return null;

  return (
    <div className="spatial-slider ui-panel">
      <label>
        Spatial zoom
        <input
          data-testid="spatial-slider"
          type="range"
          min={SPATIAL_MIN}
          max={SPATIAL_MAX}
          step={0.05}
          value={spatialExponent}
          onChange={(e) => setSpatialExponent(parseFloat(e.target.value))}
          onWheel={onRangeInputWheel}
        />
      </label>
      <span className="spatial-hint">Scroll or [ ] to zoom · Shift+scroll or Shift+[ ] for time</span>
    </div>
  );
}

export default function App() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const isFlying = useHistoryStore((s) => s.isFlying);
  const embodimentOverlay = useRealmDisplayStore((s) => s.embodimentOverlay);

  return (
    <div className={`app${isFlying ? ' app--flying' : ''}`}>
      <IntroSkipHandler />
      <WorldBootstrap />
      <EmbodimentSync />
      <PracticeSync />
      <RealmTransitionSync />
      <WorldTravelSync />
      <InitiationSync />
      <ProgressionSync />
      <EmbodiedControls />
      <PracticeControls />
      <AgeInteractionControls />
      <NpcInteractionControls />
      <KeyboardShortcuts />
      <ZoomControls />

      <Canvas
        className="canvas"
        frameloop="always"
        camera={{ fov: 60, near: 0.01, far: 3000, position: [0, 0, 0.5] }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
          gl.toneMapping = THREE.NoToneMapping;
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <IntroOverlay />

      {embodimentOverlay > 0.01 && (
        <div
          className="embodiment-fade-overlay"
          style={{ opacity: embodimentOverlay }}
          aria-hidden
        />
      )}

      {introComplete && (
        <div
          className={`ui-overlay${isFlying ? ' ui-overlay--flying' : ''}`}
          data-testid="ui-overlay"
        >
          <HeavenPhaseIndicator />
          <StarfieldIndicator />
          <BigBangReplayIndicator />
          <EphemerisIndicator />
          <CorrespondenceIndicator />
          <KnowledgeModeIndicator />
          <HistoryKeyboard />
          <EmbodimentBanner />
          <div className="ui-sidebar-left">
            <ScaleHUD />
            <EventListPanel />
          </div>
          <SpatialSlider />
          <EmbodiedOverlay />
          <WalkApproachPrompt />
          <EmbodiedPrompt />
          <InitiationPanel />
          <PracticeOverlay />
          <LinkPanel />
          <SenseWhisper />
          <JournalPanel />
          <PathPanel />
          <SplitControls />
          <EventDetailPanel />
          <TimelineLabel />
          <TimeControls />
        </div>
      )}
    </div>
  );
}
