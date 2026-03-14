import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const SEVERITY_CONFIG = {
  success: { icon: CheckCircle, bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' },
  warning: { icon: AlertTriangle, bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.3)', color: '#eab308' },
  critical: { icon: AlertCircle, bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' },
  info: { icon: Info, bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6' },
};

export default function TurnResult({ events }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) {
      setVisible([]);
      return;
    }

    // Show important events as toasts (filter out routine ones)
    const important = events.filter(e => e.severity !== 'info' || e.message.includes('mission') || e.message.includes('launched'));
    setVisible(important.slice(0, 6));

    const timer = setTimeout(() => setVisible([]), 5000);
    return () => clearTimeout(timer);
  }, [events]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-30 space-y-2 max-w-sm">
      {visible.map((event, i) => {
        const config = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.info;
        const Icon = config.icon;

        return (
          <div key={i} className="toast-enter rounded-lg px-3 py-2 flex items-start gap-2"
            style={{
              background: config.bg,
              border: `1px solid ${config.border}`,
              backdropFilter: 'blur(12px)',
              animationDelay: `${i * 80}ms`,
            }}>
            <Icon size={14} style={{ color: config.color, marginTop: 1, flexShrink: 0 }} />
            <span className="text-[11px] leading-tight" style={{ color: config.color }}>
              {event.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
