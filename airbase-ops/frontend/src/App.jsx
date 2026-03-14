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
import { Plane, Shield, Crosshair, ChevronRight, Radar, Zap, HelpCircle } from 'lucide-react';

export default function App() {
  const {
    gameState, loading, error,
    fetchState, startGame, advanceTurn, advanceMultiple,
    assignAircraft, unassignAircraft, prepAircraft, armAircraft,
    aiSuggest, aiChatSend,
  } = useGameState();

  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    const result = await aiSuggest();
    if (result?.assignments) {
      for (const assignment of result.assignments) {
        await assignAircraft(assignment.mission_id, assignment.aircraft_ids);
      }
    }
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
            <div className="absolute -inset-3 rounded-3xl border border-blue-500/20"
              style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
            <div className="absolute -inset-6 rounded-[20px] border border-blue-500/10"
              style={{ animation: 'pulse-glow 2s ease-in-out infinite', animationDelay: '0.5s' }} />
          </div>

          <h1 className="font-mono text-5xl font-bold mb-3 tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
            AIRBASE OPS
          </h1>
          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
            Gripen Dispersed Air Base Operations Simulator
          </p>
          <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
            7-day scenario &bull; Peace to War escalation &bull; 10 Gripen E aircraft
          </p>

          {/* How it works summary — right on start screen */}
          <div className="max-w-md mx-auto mb-8 text-left rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <p className="font-mono text-[10px] font-semibold tracking-widest mb-3"
              style={{ color: 'var(--text-muted)' }}>HOW IT WORKS</p>
            <div className="space-y-2">
              {[
                { num: '1', text: 'Receive daily missions (Air Tasking Order)', color: '#3b82f6' },
                { num: '2', text: 'Prep aircraft from hangar — click PREP buttons', color: '#eab308' },
                { num: '3', text: 'Assign ready aircraft to missions', color: '#ef4444' },
                { num: '4', text: 'Advance time — watch missions fly and results unfold', color: '#22c55e' },
              ].map(({ num, text, color }) => (
                <div key={num} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                    {num}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex items-center justify-center gap-4 mb-8 stagger-fade-in">
            {[
              { icon: Shield, label: 'Fleet Command', color: '#3b82f6', desc: 'Manage 10 Gripen E' },
              { icon: Crosshair, label: 'Mission Ops', color: '#ef4444', desc: 'ATO-driven sorties' },
              { icon: Radar, label: 'AI Advisor', color: '#06b6d4', desc: 'Intelligent allocation' },
              { icon: Zap, label: 'Dice System', color: '#eab308', desc: 'Board game mechanics' },
            ].map(({ icon: Icon, label, color, desc }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}20`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${color}15`;
                  e.currentTarget.style.borderColor = `${color}40`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${color}08`;
                  e.currentTarget.style.borderColor = `${color}20`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-[11px] font-mono font-semibold" style={{ color }}>{label}</span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{desc}</span>
              </div>
            ))}
          </div>

          <ShimmerButton
            onClick={startGame}
            disabled={loading}
            variant="primary"
            className="px-10 py-4 rounded-xl text-sm tracking-wider"
          >
            {loading ? 'INITIALIZING...' : 'START NEW GAME'}
            <ChevronRight size={18} />
          </ShimmerButton>

          {error && (
            <p className="text-xs mt-4" style={{ color: 'var(--status-maintenance)' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD ───
  return (
    <div className={`min-h-screen flex flex-col transition-opacity duration-500 ${dashboardReady ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'var(--bg-primary)' }}>

      {/* Onboarding Tutorial (first time) */}
      {showOnboarding && (
        <OnboardingTutorial onComplete={handleOnboardingComplete} />
      )}

      {/* Help Panel */}
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Top Bar */}
      <TopBar
        gameState={gameState}
        onAdvance={advanceTurn}
        onAdvanceMultiple={advanceMultiple}
        onNewGame={startGame}
        onToggleChat={() => setChatOpen(!chatOpen)}
        onToggleHelp={() => setShowHelp(!showHelp)}
        loading={loading}
      />

      {/* Smart "What to do next" hint bar */}
      <NextActionHint gameState={gameState} />

      {/* Turn Results */}
      <TurnResult events={gameState.turn_results} />

      {/* Main Content — 3 Column Layout */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left — ATO Panel */}
        <div className="w-72 shrink-0 glass-panel rounded-xl p-3 overflow-hidden flex flex-col animate-fade-in-up"
          style={{ border: '1px solid var(--border-color)', animationDelay: '100ms' }}>
          <ATOPanel
            ato={gameState.current_ato}
            aircraft={gameState.aircraft}
            phase={gameState.phase}
            onAssign={assignAircraft}
            onUnassign={unassignAircraft}
            onAiSuggest={handleAiSuggest}
            loading={loading}
          />
        </div>

        {/* Center — Fleet + Timeline + Log */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Fleet Board */}
          <div className="glass-panel rounded-xl p-3 flex-1 animate-fade-in-up"
            style={{ border: '1px solid var(--border-color)', animationDelay: '200ms' }}>
            <FleetBoard
              aircraft={gameState.aircraft}
              onSelect={setSelectedAircraft}
              onPrep={prepAircraft}
            />
          </div>

          {/* Timeline */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <TimelineBar ato={gameState.current_ato} currentHour={gameState.current_hour} />
          </div>

          {/* Event Log */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <EventLog events={gameState.event_log} />
          </div>
        </div>

        {/* Right — Resource Panel */}
        <div className="w-56 shrink-0 glass-panel rounded-xl p-3 overflow-hidden flex flex-col animate-fade-in-up"
          style={{ border: '1px solid var(--border-color)', animationDelay: '150ms' }}>
          <ResourcePanel
            resources={gameState.resources}
            personnel={gameState.personnel}
          />
        </div>
      </div>

      {/* Aircraft Detail Modal */}
      {selectedAircraft && (
        <AircraftDetail
          aircraft={selectedAircraft}
          onClose={() => setSelectedAircraft(null)}
          onPrep={prepAircraft}
          onArm={handleArm}
        />
      )}

      {/* AI Chat Drawer */}
      <AIChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onSend={aiChatSend}
      />
    </div>
  );
}
