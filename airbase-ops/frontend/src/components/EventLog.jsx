import { useState, useRef, useEffect } from 'react';
import { ScrollText, AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { formatClockTime } from '../lib/format';

const SEVERITY_ICONS = {
  success: { icon: CheckCircle, color: '#22c55e' },
  warning: { icon: AlertTriangle, color: '#eab308' },
  critical: { icon: AlertCircle, color: '#ef4444' },
  info: { icon: Info, color: '#3b82f6' },
};

export default function EventLog({ events, variant = 'default', onClose }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const filtered = filter === 'all' ? events : events.filter(e => e.severity === filter);
  const displayEvents = expanded ? filtered : filtered.slice(-10);

  const isOverlay = variant === 'overlay';
  const containerStyle = isOverlay 
    ? { background: 'rgba(10, 15, 25, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }
    : { border: '1px solid var(--border-color)' };

  return (
    <div className={`rounded-xl overflow-hidden ${isOverlay ? 'shadow-2xl' : 'glass-panel'}`} style={containerStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ 
          background: isOverlay ? 'rgba(0,0,0,0.3)' : 'transparent',
          borderBottom: isOverlay ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--border-color)' 
        }}>
        <div className="flex items-center gap-2">
          <ScrollText size={12} style={{ color: isOverlay ? 'var(--status-mission)' : 'var(--text-secondary)' }} />
          <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color: isOverlay ? '#e2e8f0' : 'var(--text-secondary)' }}>
            EVENT LOG
          </span>
          <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
            ({events.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {['all', 'critical', 'warning', 'info', 'success'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase transition-all"
              style={{
                background: filter === f ? 'var(--bg-tertiary)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                border: filter === f ? '1px solid var(--border-color)' : '1px solid transparent',
              }}>
              {f}
            </button>
          ))}
          <button onClick={() => setExpanded(!expanded)}
            className="px-1.5 py-0.5 rounded text-[8px] font-mono transition-all ml-1"
            style={{ color: 'var(--text-muted)' }}>
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          {onClose && (
            <button onClick={onClose} className="ml-1 hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Events */}
      <div ref={scrollRef}
        className="overflow-y-auto px-4 py-2 custom-scrollbar"
        style={{ 
          maxHeight: expanded ? (isOverlay ? '600px' : '400px') : '180px',
          maskImage: isOverlay ? 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' : 'none',
          WebkitMaskImage: isOverlay ? 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' : 'none',
        }}>
        {displayEvents.length === 0 ? (
           <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
            No events to display
          </p>
        ) : (
          displayEvents.map((event, i) => {
            const sev = SEVERITY_ICONS[event.severity] || SEVERITY_ICONS.info;
            const SevIcon = sev.icon;
            return (
              <div key={i} className="flex items-start gap-3 py-2"
                style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                <SevIcon size={14} style={{ color: sev.color, marginTop: 3, flexShrink: 0 }} />
                <span className="font-mono text-[11px] shrink-0 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  D{event.day} {formatClockTime(event.hour)}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {event.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
