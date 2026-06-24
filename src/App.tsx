import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { EmbodiedCamera } from './camera/EmbodiedCamera';
import { LogarithmicCamera } from './camera/LogarithmicCamera';
import { EmbodimentSync } from './core/EmbodimentSync';
import { PracticeSync } from './core/PracticeSync';
import { IntroSkipHandler, useIntroActive } from './core/IntroSkipHandler';
import { SimulationLoop } from './core/SimulationLoop';
import { useIntroStore } from './core/IntroState';
import { useHistoryStore } from './core/HistoryState';
import { useObserverStore } from './core/ObserverState';
import { usePracticeStore } from './core/PracticeState';
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
import { ZoomControls } from './ui/ZoomControls';
import { BigBangEffect } from './world/BigBangEffect';
import { DebugGrid } from './world/DebugGrid';
import { EmbodiedSite } from './world/EmbodiedSite';
import { LiminalEffects } from './world/LiminalEffects';
import { SpiritualRealm } from './world/SpiritualRealm';
import { HistoryMarkers } from './world/HistoryMarkers';
import { PlayerAvatar } from './world/PlayerAvatar';
import { WorldRoot } from './world/WorldRoot';

function Scene() {
  const introPhase = useIntroStore((s) => s.phase);
  const mode = useObserverStore((s) => s.mode);
  const realmPhase = usePracticeStore((s) => s.realmPhase);
  const showWorld = introPhase === 'expansion' || introPhase === 'reveal' || introPhase === 'complete';
  const embodied = mode === 'embodied' && showWorld;
  const showLiminal = embodied && (realmPhase === 'liminal' || realmPhase === 'spiritual');

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#030508', embodied ? 15 : 80, embodied ? 55 : 350]} />
      <ambientLight intensity={embodied ? 0.45 : 0.15} />
      {embodied ? <EmbodiedCamera /> : <LogarithmicCamera />}
      <SimulationLoop />
      <BigBangEffect />
      {embodied ? (
        <>
          <directionalLight position={[8, 16, 6]} intensity={1.1} castShadow />
          <EmbodiedSite />
          <PlayerAvatar />
          {showLiminal && <LiminalEffects />}
          {realmPhase === 'spiritual' && <SpiritualRealm />}
        </>
      ) : (
        showWorld && (
          <>
            <WorldRoot />
            <HistoryMarkers />
          </>
        )
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
          type="range"
          min={SPATIAL_MIN}
          max={SPATIAL_MAX}
          step={0.05}
          value={spatialExponent}
          onChange={(e) => setSpatialExponent(parseFloat(e.target.value))}
        />
      </label>
      <span className="spatial-hint">Scroll to zoom · Shift+scroll for time precision</span>
    </div>
  );
}

export default function App() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const isFlying = useHistoryStore((s) => s.isFlying);
  const realmPhase = usePracticeStore((s) => s.realmPhase);

  return (
    <div
      className={`app${isFlying ? ' app--flying' : ''} app--realm-${realmPhase}`}
    >
      <IntroSkipHandler />
      <EmbodimentSync />
      <PracticeSync />
      <EmbodiedControls />
      <PracticeControls />
      <KeyboardShortcuts />
      <ZoomControls />

      <Canvas
        className="canvas"
        camera={{ fov: 60, near: 0.01, far: 3000, position: [0, 0, 0.5] }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <IntroOverlay />

      {introComplete && (
        <div className={`ui-overlay${isFlying ? ' ui-overlay--flying' : ''}`}>
          <HistoryKeyboard />
          <EmbodimentBanner />
          <div className="ui-sidebar-left">
            <ScaleHUD />
            <EventListPanel />
          </div>
          <SpatialSlider />
          <EmbodiedOverlay />
          <EmbodiedPrompt />
          <PracticeOverlay />
          <EventDetailPanel />
          <TimelineLabel />
          <TimeControls />
        </div>
      )}
    </div>
  );
}
