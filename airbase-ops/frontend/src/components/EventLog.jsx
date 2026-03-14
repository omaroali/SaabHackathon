import { useState, useRef, useEffect } from 'react';
import { ScrollText, AlertCircle, AlertTriangle, Info, CheckCircle, Filter } from 'lucide-react';

const SEVERITY_ICONS = {
  success: { icon: CheckCircle, color: '#22c55e' },
  warning: { icon: AlertTriangle, color: '#eab308' },
  critical: { icon: AlertCircle, color: '#ef4444' },
  info: { icon: Info, color: '#3b82f6' },
};

export default function EventLog({ events }) {
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

  return (
    <div className="glass-panel rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <ScrollText size={12} style={{ color: 'var(--text-secondary)' }} />
          <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
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
        </div>
      </div>

      {/* Events */}
      <div ref={scrollRef}
        className="overflow-y-auto px-3 py-1"
        style={{ maxHeight: expanded ? '300px' : '120px' }}>
        {displayEvents.length === 0 ? (
          <p className="text-[10px] py-2 text-center" style={{ color: 'var(--text-muted)' }}>
            No events to display
          </p>
        ) : (
          displayEvents.map((event, i) => {
            const sev = SEVERITY_ICONS[event.severity] || SEVERITY_ICONS.info;
            const SevIcon = sev.icon;
            return (
              <div key={i} className="flex items-start gap-2 py-1"
                style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                <SevIcon size={10} style={{ color: sev.color, marginTop: 2, flexShrink: 0 }} />
                <span className="font-mono text-[9px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                  D{event.day} {String(event.hour).padStart(2, '0')}:00
                </span>
                <span className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
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
