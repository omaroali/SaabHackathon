import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Fuel, Wrench, X, Shield } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Assess readiness', icon: Shield, prompt: 'Assess current fleet readiness and availability.' },
  { label: 'Fuel forecast', icon: Fuel, prompt: 'What does our fuel situation look like? Will we have enough for the remaining days?' },
  { label: 'Maint priorities', icon: Wrench, prompt: 'What are the current maintenance priorities? Which aircraft should we focus on?' },
];

export default function AIChat({ isOpen, onClose, onSend }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'AirBase AI online. I can help with fleet management, resource allocation, and mission planning. What do you need, commander?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || sending) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setSending(true);

    const result = await onSend(msg);
    setSending(false);

    if (result?.response) {
      setMessages(prev => [...prev, { role: 'ai', text: result.response }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 z-40 animate-slide-in-right flex flex-col"
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-color)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}>

      {/* Header — gradient accent bar */}
      <div className="relative" style={{ borderBottom: '1px solid var(--border-color)' }}>
        {/* Animated top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--ai-accent), transparent)',
            backgroundSize: '200% 100%',
            animation: 'gradientShift 3s ease-in-out infinite',
          }} />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center relative"
              style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
              <Bot size={16} style={{ color: 'var(--ai-accent)' }} />
              {/* Live dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full status-breathe"
                style={{ backgroundColor: '#22c55e', '--glow-color': 'rgba(34,197,94,0.5)' }} />
            </div>
            <div>
              <h3 className="font-mono text-xs font-bold" style={{ color: 'var(--ai-accent)' }}>AI ADVISOR</h3>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Operational Intelligence</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.target.style.background = 'var(--bg-tertiary)'}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            style={{ animationDelay: `${i * 50}ms` }}>
            <div className="max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed transition-all duration-200"
              style={msg.role === 'ai' ? {
                background: 'var(--bg-primary)',
                borderLeft: '2px solid var(--ai-accent)',
                color: 'var(--text-primary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
              } : {
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: 'var(--text-primary)',
              }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Animated typing indicator */}
        {sending && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="rounded-lg px-4 py-3 flex items-center gap-2"
              style={{
                background: 'var(--bg-primary)',
                borderLeft: '2px solid var(--ai-accent)',
              }}>
              <Bot size={12} style={{ color: 'var(--ai-accent)' }} />
              <div className="typing-dots flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--ai-accent)' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--ai-accent)' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--ai-accent)' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 flex gap-1.5 overflow-x-auto"
        style={{ borderTop: '1px solid var(--border-color)' }}>
        {QUICK_ACTIONS.map((action, i) => (
          <button key={i} onClick={() => handleSend(action.prompt)}
            disabled={sending}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[9px] font-mono shrink-0 transition-all duration-200 disabled:opacity-40"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = 'var(--ai-accent)';
              e.target.style.color = 'var(--ai-accent)';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.color = 'var(--text-secondary)';
            }}>
            <action.icon size={9} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask the AI advisor..."
            disabled={sending}
            className="flex-1 rounded-lg px-3 py-2 text-xs outline-none transition-all duration-200"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--ai-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button onClick={() => handleSend()} disabled={sending || !input.trim()}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
            style={{ background: 'var(--ai-accent)', color: '#fff' }}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
