import { useState } from 'react';
import {
  HelpCircle, X, Plane, Target, Clock, Wrench, Fuel,
  Shield, Crosshair, Bomb, Zap, ChevronDown, ChevronRight, ArrowRight
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Game Flow',
    icon: ArrowRight,
    color: '#22c55e',
    items: [
      { term: '1. Start of Day', desc: 'Receive ATO (Air Tasking Order) — your mission list for the day.' },
      { term: '2. Prep Aircraft', desc: 'Click "PREP" on hangar aircraft. Takes 4 hours to complete.' },
      { term: '3. Assign to Missions', desc: 'Click "+ Assign" on ATO missions. Pick from ready aircraft.' },
      { term: '4. Advance Time', desc: 'Click "1H" or "1D". Missions launch at their scheduled hour.' },
      { term: '5. Results', desc: 'Aircraft return, get checked, may need maintenance. Repeat!' },
    ],
  },
  {
    title: 'Aircraft States',
    icon: Plane,
    color: '#3b82f6',
    items: [
      { term: 'HANGAR (Grey)', desc: 'Not ready. Click "PREP" to start pre-flight preparation.' },
      { term: 'PREPPING (Yellow)', desc: 'Being prepared. Completes in 4 hours. 33% chance of discovering a fault.' },
      { term: 'READY (Green)', desc: 'Mission capable! Can be assigned to ATO missions.' },
      { term: 'ON MISSION (Blue)', desc: 'Currently flying. Returns after the mission duration.' },
      { term: 'LANDING (Yellow)', desc: 'Post-flight check. 50% chance of needing maintenance.' },
      { term: 'MAINT (Red)', desc: 'Under repair. Duration: 2-16h depending on fault type.' },
    ],
  },
  {
    title: 'Mission Types',
    icon: Target,
    color: '#ef4444',
    items: [
      { term: 'QRA', desc: 'Quick Reaction Alert — air defense standby. 2h duration, 2 aircraft.' },
      { term: 'DCA', desc: 'Defensive Counter Air — air patrol. Needs missiles.' },
      { term: 'RECCE', desc: 'Reconnaissance — intel gathering. Needs recon pods.' },
      { term: 'ATTACK', desc: 'Strike mission — bombs required. Highest risk.' },
      { term: 'ESCORT', desc: 'Escort mission — protect other aircraft.' },
    ],
  },
  {
    title: 'Resources',
    icon: Fuel,
    color: '#f59e0b',
    items: [
      { term: 'Fuel', desc: '~200L per flight hour. Aircraft tank: 1000L. Base storage is limited.' },
      { term: 'Weapons', desc: 'Missiles & bombs consumed per mission. 10-100% random loss.' },
      { term: 'Exchange Units (UE)', desc: 'Critical spare parts. Limited supply, 30-day MRO repair cycle.' },
      { term: 'Spare Parts', desc: 'Used during maintenance. Running out grounds aircraft.' },
      { term: 'Personnel', desc: '3 crews per shift (8h). Each crew handles one aircraft at a time.' },
    ],
  },
  {
    title: 'UI Guide',
    icon: HelpCircle,
    color: '#8b5cf6',
    items: [
      { term: 'Top Bar', desc: 'Day/time, phase indicator, advance buttons (1H/1D), AI toggle, reset.' },
      { term: 'Left Panel (ATO)', desc: 'Today\'s missions. Click +Assign, or use "AI Suggest" for auto-assignment.' },
      { term: 'Center (Fleet)', desc: '10 aircraft cards. Click to view details. "PREP" to start from hangar.' },
      { term: 'Right Panel (Resources)', desc: 'Base fuel, weapons, spare parts, exchange units, personnel.' },
      { term: 'Timeline (Bottom)', desc: '24-hour overview of when missions are scheduled.' },
      { term: 'Event Log', desc: 'Mission results, maintenance events, warnings. Filter by severity.' },
      { term: 'AI Chat', desc: 'Click the AI button in top bar to ask the AI advisor questions.' },
    ],
  },
];

export default function HelpPanel({ isOpen, onClose }) {
  const [openSection, setOpenSection] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="glass-panel rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col animate-scale-pop"
        onClick={e => e.stopPropagation()}
        style={{ border: '1px solid var(--border-accent)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)' }}>
              <HelpCircle size={18} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h2 className="font-mono text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                How to Play
              </h2>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Quick reference guide
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Accordion Sections */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {SECTIONS.map((section, si) => {
            const SectionIcon = section.icon;
            const isExpanded = openSection === si;
            return (
              <div key={si} className="mb-2">
                <button
                  onClick={() => setOpenSection(isExpanded ? -1 : si)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                  style={{
                    background: isExpanded ? `${section.color}08` : 'transparent',
                    border: `1px solid ${isExpanded ? section.color + '25' : 'transparent'}`,
                  }}>
                  <SectionIcon size={14} style={{ color: section.color }} />
                  <span className="flex-1 text-left font-mono text-xs font-semibold"
                    style={{ color: isExpanded ? section.color : 'var(--text-primary)' }}>
                    {section.title}
                  </span>
                  {isExpanded
                    ? <ChevronDown size={14} style={{ color: section.color }} />
                    : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  }
                </button>

                {isExpanded && (
                  <div className="px-3 pb-2 space-y-2 mt-1 stagger-fade-in">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex gap-2 pl-5 py-1"
                        style={{ borderLeft: `2px solid ${section.color}25` }}>
                        <div>
                          <span className="font-mono text-[11px] font-semibold block"
                            style={{ color: section.color }}>
                            {item.term}
                          </span>
                          <span className="text-[11px] leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 text-center"
          style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Press <kbd className="font-mono px-1 py-0.5 rounded text-[9px]"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>?</kbd> anytime to reopen this guide
          </p>
        </div>
      </div>
    </div>
  );
}
