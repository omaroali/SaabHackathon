import { useState } from 'react';
import {
  Plane, ChevronRight, ChevronLeft, Play, FastForward,
  Target, Wrench, Shield, Crosshair, Fuel, MessageSquare,
  Clock, Zap, Eye, X, HelpCircle, ArrowRight
} from 'lucide-react';
import ShimmerButton from './ShimmerButton';

const STEPS = [
  {
    title: 'Welcome, Commander',
    icon: Plane,
    color: '#3b82f6',
    content: 'You are the base commander (basbatchef) of a Swedish Gripen air base. Your job is to manage 10 fighter jets over a 7-day scenario that escalates from Peace to Crisis to War.',
    details: [
      'Each turn = 1 hour of simulated time',
      'Day 1 is peaceful, Days 2-4 are Crisis, Days 5-7 are War',
      'Mission tempo increases as the situation escalates',
    ],
  },
  {
    title: 'The Game Loop',
    icon: Clock,
    color: '#22c55e',
    content: 'Every day you receive an Air Tasking Order (ATO) — a list of missions you must fly. Your job is to prepare aircraft, assign them, and advance time.',
    details: [
      '1. PREP aircraft in the hangar (takes 1 hour)',
      '2. ASSIGN ready aircraft to ATO missions',
      '3. ADVANCE TIME with the 1H or 4H buttons',
      '4. Watch missions fly, aircraft land, and results unfold',
    ],
  },
  {
    title: 'Aircraft States',
    icon: Shield,
    color: '#eab308',
    content: 'Each aircraft cycles through states. Understanding these is key:',
    details: [
      'HANGAR — Not ready. Click "PREP" to begin preparation',
      'PREPPING — Being prepared (1 hour). May discover faults!',
      'READY — Mission capable. Can be assigned to missions',
      'ON MISSION — Flying. Will return after mission duration',
      'LANDING — Post-flight checks. 50% chance of needing maintenance',
      'MAINT — Under repair. Duration varies (2-16 hours)',
    ],
  },
  {
    title: 'Missions & Assignment',
    icon: Target,
    color: '#ef4444',
    content: 'The ATO panel (left side) shows today\'s missions. Each mission has a type, time, and required number of aircraft.',
    details: [
      'Click "+ Assign" on a mission to assign a ready aircraft',
      'Missions auto-launch when their scheduled hour arrives',
      'QRA = Quick Reaction Alert (air defense standby)',
      'RECCE = Reconnaissance (intelligence gathering)',
      'DCA = Defensive Counter Air (air defense patrols)',
      'ATTACK = Strike missions (bombs required)',
    ],
  },
  {
    title: 'Resources & Risks',
    icon: Fuel,
    color: '#f59e0b',
    content: 'Your base has limited fuel, weapons, spare parts, and maintenance crews. Every flight consumes resources.',
    details: [
      'Fuel: 200L consumed per flight hour. Monitor storage!',
      'Weapons: Missiles and bombs are partially consumed each mission',
      'Exchange Units (UE): Critical spares. 30-day repair cycle',
      'Personnel: 3 crews per 8-hour shift. Each handles 1 aircraft',
      'Dice rolls determine faults, weapon loss, and maintenance time',
    ],
  },
  {
    title: 'AI Advisor & Tips',
    icon: MessageSquare,
    color: '#06b6d4',
    content: 'Use the AI Advisor for smart aircraft allocation suggestions and strategic advice.',
    details: [
      'Click "AI Suggest" to auto-assign aircraft to missions',
      'Open the AI chat panel to ask strategic questions',
      'Don\'t send ALL your best aircraft at once — keep reserves',
      'Watch for Day 4 — a cruise missile attack hits the base!',
      'Balance prep and maintenance to keep aircraft cycling',
    ],
  },
];

export default function OnboardingTutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg animate-scale-pop" onClick={e => e.stopPropagation()}>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === step ? current.color : 'var(--border-color)',
                transform: i === step ? 'scale(1.5)' : 'scale(1)',
                boxShadow: i === step ? `0 0 8px ${current.color}88` : 'none',
              }} />
          ))}
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${current.color}30` }}>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center gap-4"
            style={{ borderBottom: `1px solid ${current.color}15` }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${current.color}15`,
                border: `1px solid ${current.color}30`,
              }}>
              <Icon size={26} style={{ color: current.color }} />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>
                STEP {step + 1} OF {STEPS.length}
              </p>
              <h2 className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {current.title}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {current.content}
            </p>

            <div className="space-y-2">
              {current.details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <ArrowRight size={12} className="shrink-0 mt-1" style={{ color: current.color }} />
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border-color)' }}>
            <button onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-xs transition-all disabled:opacity-30"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              <ChevronLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-2">
              <button onClick={onComplete}
                className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all"
                style={{ color: 'var(--text-muted)' }}>
                Skip tutorial
              </button>

              {isLast ? (
                <ShimmerButton onClick={onComplete}
                  variant="primary"
                  className="px-5 py-2 rounded-lg text-xs">
                  Start Playing <ChevronRight size={14} />
                </ShimmerButton>
              ) : (
                <ShimmerButton onClick={() => setStep(step + 1)}
                  variant="cyan"
                  className="px-5 py-2 rounded-lg text-xs">
                  Next <ChevronRight size={14} />
                </ShimmerButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
