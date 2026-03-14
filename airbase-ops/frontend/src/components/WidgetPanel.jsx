import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, GripHorizontal } from 'lucide-react';

/**
 * WidgetPanel — A wrapper for UI panels (ATO, Fleet, Resources) that allows
 * them to be toggled between "Floating Window" mode over the map, or "Sidebar" mode.
 */

export default function WidgetPanel({
  children,
  side = 'left', // 'left' or 'right'
  title = "Panel",
  width = "320px",
  style = {}
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Position classes based on mode
  const baseClasses = "flex flex-col transition-all duration-300 ease-in-out shadow-lg glass-panel relative z-20 h-full rounded-2xl border border-[var(--border-color)] overflow-visible";
  
  // Handle collapsed state purely via width transition
  const currentWidth = isCollapsed ? '48px' : width;

  return (
    <div
      className={baseClasses}
      style={{
        width: currentWidth,
        minWidth: currentWidth,
        background: 'rgba(12, 14, 18, 0.6)',
        backdropFilter: 'blur(24px)',
        zIndex: 10,
        ...style
      }}
    >
      {/* Header / Grab Bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.015)]">
        
        {/* Title (Hidden if collapsed) */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
             <GripHorizontal size={12} className="text-[var(--text-muted)] shrink-0 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity" />
             <span className="font-mono text-[10px] font-bold tracking-widest text-[var(--text-primary)] truncate">
               {title}
             </span>
          </div>
        )}

        {/* Controls */}
        <div className={`flex items-center gap-1 ${isCollapsed ? 'w-full justify-center' : ''}`}>
          
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
            title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
          >
            {side === 'left' ? (
              isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />
            ) : (
              isCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`flex-1 overflow-hidden transition-opacity duration-300 ${isCollapsed ? 'opacity-0 select-none pointer-events-none' : 'opacity-100'}`}
      >
         <div className="h-full w-full overflow-y-auto overflow-x-visible p-4 custom-scrollbar">
            {children}
         </div>
      </div>
    </div>
  );
}
