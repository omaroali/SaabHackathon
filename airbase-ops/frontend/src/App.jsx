import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import TopBar from './components/TopBar';
import FleetBoard from './components/FleetBoard';
import AircraftDetail from './components/AircraftDetail';
import ResourcePanel from './components/ResourcePanel';
import ATOPanel from './components/ATOPanel';
import AIChat from './components/AIChat';
import TurnResult from './components/TurnResult';
import EventLog from './components/EventLog';
import TimelineBar from './components/TimelineBar';
import ParticlesBackground from './components/ParticlesBackground';
import ShimmerButton from './components/ShimmerButton';
import OnboardingTutorial from './components/OnboardingTutorial';
import NextActionHint from './components/NextActionHint';
import HelpPanel from './components/HelpPanel';
import DecisionImpactPanel from './components/DecisionImpactPanel';
import CompareMode from './components/CompareMode';
import AIRecommendationCards from './components/AIRecommendationCards';
import TacticalMap from './components/TacticalMap';
import WidgetPanel from './components/WidgetPanel';
import { Plane, Shield, Crosshair, ChevronRight, Radar, AlertTriangle, ScrollText } from 'lucide-react';

export default function App() {
  const {
    gameState, loading, error,
    metrics, prevMetrics,
    comparison, compareLoading,
    recommendations, recsLoading,
    fetchState, startGame, advanceTurn, advanceMultiple,
    assignAircraft, unassignAircraft, planMission, prepAircraft, armAircraft,
    aiSuggest, aiChatSend,
    fetchCompare, fetchRecommendations, fetchMetrics,
  } = useGameState();

  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);
  const [centerView, setCenterView] = useState('map');
  const [helpAttention, setHelpAttention] = useState(false);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Show onboarding on first game start
  useEffect(() => {
    if (gameState && !localStorage.getItem('airbase_onboarding_seen')) {
      setShowOnboarding(true);
    }
  }, [gameState]);

  // Animate dashboard mount
  useEffect(() => {
    if (gameState) {
      const timer = setTimeout(() => setDashboardReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setDashboardReady(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (!selectedAircraft || !gameState) return;
    const freshAircraft = gameState.aircraft.find((aircraft) => aircraft.id === selectedAircraft.id);
    setSelectedAircraft(freshAircraft || null);
  }, [gameState, selectedAircraft]);

  useEffect(() => {
    if (!gameState || showHelp) {
      setHelpAttention(false);
      return;
    }

    let timeoutId;
    const resetIdleTimer = () => {
      setHelpAttention(false);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setHelpAttention(true);
      }, 20000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer));
    };
  }, [gameState, showHelp]);

  // Keyboard shortcut: ? for help panel
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const tag = e.target.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          setShowHelp(prev => !prev);
        }
      }
      if (e.key === 'Escape') {
        setShowHelp(false);
        setShowOnboarding(false);
        setShowCompare(false);
        setShowRecs(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('airbase_onboarding_seen', 'true');
  };

  const handleAiSuggest = async () => {
    setShowRecs(true);
    const result = await fetchRecommendations();
    if (!result) {
      const fallback = await aiSuggest();
      if (fallback?.assignments) {
        for (const assignment of fallback.assignments) {
          await assignAircraft(assignment.mission_id, assignment.aircraft_ids);
        }
      }
      setShowRecs(false);
    }
  };

  const handleApplyRecommendations = async () => {
    if (recommendations?.assignments) {
      for (const assignment of recommendations.assignments) {
        await assignAircraft(assignment.mission_id, assignment.aircraft_ids);
      }
    }
    setShowRecs(false);
  };

  const handleCompare = () => {
    setShowCompare(true);
    fetchCompare();
  };

  const handleArm = (aircraftId) => {
    armAircraft(aircraftId, 2, 0, 0);
  };

  // ─── START SCREEN ───
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}>

        {/* Animated particle background */}
        <ParticlesBackground />

        {/* Radial gradient overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06), transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.04), transparent 60%)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative z-10 text-center animate-fade-in-up">
          {/* Logo */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center animate-scale-pop"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.35), 0 0 100px rgba(59, 130, 246, 0.1)',
              }}>
              <Plane size={40} className="text-white" />
            </div>
          </div>

          <h1 className="font-mono text-5xl font-bold mb-3 tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
            AIRBASE OPS
          </h1>
          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
            Gripen Dispersed Air Base Operations Simulator
          </p>
          <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
            30-day campaign &bull; Peace to War escalation &bull; 10 Gripen E aircraft
          </p>

          <ShimmerButton
            onClick={startGame}
            disabled={loading}
            variant="primary"
            className="px-10 py-4 rounded-xl text-sm tracking-wider"
          >
            {loading ? 'INITIALIZING...' : 'START COMMAND CENTER'}
            <ChevronRight size={18} />
          </ShimmerButton>
        </div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD ───
  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-opacity duration-500 ${dashboardReady ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: '#0a0b0e' }}>

      {/* 1. Top UI Layer (Z-20) */}
      <div className="relative z-20 flex flex-col w-full shrink-0">
        <TopBar
          gameState={gameState}
          onAdvance={advanceTurn}
          onAdvanceMultiple={advanceMultiple}
          onNewGame={startGame}
          onToggleChat={() => setChatOpen(!chatOpen)}
          onToggleHelp={() => {
            setShowHelp(!showHelp);
            setHelpAttention(false);
          }}
          onCompare={handleCompare}
          loading={loading}
          helpAttention={helpAttention}
        />
        <DecisionImpactPanel metrics={metrics} prevMetrics={prevMetrics} />
        
        {error && (
          <div className="mx-6 mt-2 px-3 py-2 rounded-lg flex items-center gap-2 animate-fade-in-up"
               style={{ background: 'rgba(239,68,68,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239,68,68,0.5)' }}>
            <AlertTriangle size={12} style={{ color: '#ef4444' }} />
            <span className="text-xs text-red-100">{error}</span>
          </div>
        )}
        <NextActionHint gameState={gameState} />
      </div>

      {/* 2. Main 3-Column Workspace Layer */}
      <div className="relative z-10 flex-1 flex flex-wrap xl:flex-nowrap my-4 px-4 md:px-6 gap-6 overflow-visible">
        
        {/* LEFT SIDEBAR: ATO */}
        <div className="h-full flex flex-col shrink-0 min-w-0">
          <WidgetPanel title="AIR TASKING ORDER" side="left" width="300px">
            <div className="flex flex-col h-full gap-4 pb-10">
              <ATOPanel
                ato={gameState.current_ato}
                aircraft={gameState.aircraft}
                phase={gameState.phase}
                currentHour={gameState.current_hour}
                onAssign={assignAircraft}
                onUnassign={unassignAircraft}
                onPlan={planMission}
                onAiSuggest={handleAiSuggest}
                loading={loading}
              />
            </div>
          </WidgetPanel>
        </div>

        {/* CENTER OPERATIONS WORKSPACE */}
        <div className="flex-1 h-full flex flex-col gap-6 overflow-visible min-w-[320px]">

          <div className="shrink-0 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
                OPS WORKSPACE
              </span>
              <div className="flex items-center gap-1 rounded-xl p-1"
                style={{ background: 'rgba(12,14,18,0.72)', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setCenterView('map')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors"
                  style={{
                    background: centerView === 'map' ? 'rgba(56,189,248,0.18)' : 'transparent',
                    color: centerView === 'map' ? '#7dd3fc' : 'var(--text-muted)',
                  }}
                >
                  <Radar size={12} />
                  Map
                </button>
                <button
                  onClick={() => setCenterView('fleet')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors"
                  style={{
                    background: centerView === 'fleet' ? 'rgba(34,197,94,0.18)' : 'transparent',
                    color: centerView === 'fleet' ? '#86efac' : 'var(--text-muted)',
                  }}
                >
                  <Plane size={12} />
                  Fleet Ops
                </button>
              </div>
            </div>

            <div className="font-mono text-[10px] px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(12,14,18,0.72)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              {centerView === 'map'
                ? 'Route awareness, flight tracking, mission package status'
                : 'Full fleet board for aircraft prep and detailed management'}
            </div>
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] min-h-[400px]">
            <div className="absolute inset-0 z-0 bg-[#0f1014] animate-pulse" />
            {centerView === 'map' ? (
              <TacticalMap gameState={gameState} onSelectAircraft={setSelectedAircraft} />
            ) : (
              <div className="absolute inset-0 p-5 overflow-y-auto"
                style={{
                  background: 'radial-gradient(circle at top left, rgba(34,197,94,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(59,130,246,0.08), transparent 30%), #0f1014',
                }}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                      FLEET OPERATIONS BOARD
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Select an aircraft to inspect loadout, service margin, and prep actions.
                    </div>
                  </div>
                  <button
                    onClick={() => setCenterView('map')}
                    className="px-3 py-2 rounded-lg font-mono text-[11px] transition-colors"
                    style={{ background: 'rgba(56,189,248,0.14)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.22)' }}
                  >
                    Return to Map
                  </button>
                </div>
                <FleetBoard
                  aircraft={gameState.aircraft}
                  onSelect={setSelectedAircraft}
                  onPrep={prepAircraft}
                />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="shrink-0 w-full mb-2">
             <TimelineBar ato={gameState.current_ato} currentHour={gameState.current_hour} />
          </div>
        </div>

        {/* RIGHT SIDEBAR: Resources */}
        <div className="h-full flex flex-col shrink-0 min-w-0">
          <WidgetPanel title="BASE STATUS" side="right" width="300px">
             <div className="flex flex-col gap-5 pb-10">
               <ResourcePanel
                  resources={gameState.resources}
                  personnel={gameState.personnel}
               />
             </div>
          </WidgetPanel>
        </div>

      </div>

      {/* 3. Overlays & Modals (Z-50) */}
      <TurnResult events={gameState.turn_results} />
      
      {/* Event Log Toggle & Popup */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setShowEventLog(!showEventLog)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
        >
          <ScrollText size={16} style={{ color: 'var(--text-secondary)' }} />
          <span className="font-mono text-xs font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
            EVENT LOG
          </span>
          {gameState.event_log && gameState.event_log.some(e => e.severity === 'critical' || e.severity === 'warning') && (
            <span className="flex h-2.5 w-2.5 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>

      {showEventLog && (
        <div className="fixed bottom-20 right-4 md:right-6 z-[60] w-[min(500px,calc(100vw-2rem))] shadow-2xl animate-fade-in-up">
           <EventLog events={gameState.event_log} onClose={() => setShowEventLog(false)} />
        </div>
      )}
      
      {showOnboarding && <OnboardingTutorial onComplete={handleOnboardingComplete} />}
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      {selectedAircraft && (
        <AircraftDetail
          aircraft={selectedAircraft}
          currentAto={gameState.current_ato}
          onClose={() => setSelectedAircraft(null)}
          onPrep={prepAircraft}
          onArm={handleArm}
        />
      )}

      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} onSend={aiChatSend} />
      
      <CompareMode
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        comparison={comparison}
        loading={compareLoading}
        onCompare={fetchCompare}
      />

      <AIRecommendationCards
        isOpen={showRecs}
        recommendations={recommendations}
        loading={recsLoading}
        onClose={() => setShowRecs(false)}
        onApply={handleApplyRecommendations}
      />
    </div>
  );
}
