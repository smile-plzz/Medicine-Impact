import React, { useState } from 'react';
import { BodySystemEffect } from '../types';
import { Info } from 'lucide-react';

interface HumanBodyProps {
  effects: BodySystemEffect[];
  selectedSystem: string | null;
  onSystemSelect: (system: string) => void;
}

// Systems the SVG silhouette below has a dedicated shape for. Any effect
// reported for a system outside this list has no anatomical click target,
// so it's surfaced separately as a chip (see "Other Systems" below).
const ANATOMICAL_SYSTEMS = [
  'Brain', 'Eyes', 'Lungs', 'Heart', 'Liver', 'Stomach', 'Kidneys', 'Intestines', 'Pancreas',
];

const getSeverityBadgeClass = (severity: number) => {
  if (severity === 0) return 'bg-gray-800/50 text-gray-400 border-gray-700';
  if (severity <= 3) return 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50';
  if (severity <= 6) return 'bg-orange-950/50 text-orange-400 border-orange-900/50';
  if (severity <= 8) return 'bg-red-950/50 text-red-400 border-red-900/50';
  return 'bg-red-900/60 text-red-300 border-red-700 shadow-[0_0_10px_rgba(248,113,113,0.3)]';
};

const getSeverityColor = (severity: number) => {
  if (severity === 0) return 'fill-gray-800 hover:fill-gray-700';
  if (severity <= 3) return 'fill-yellow-600/80 hover:fill-yellow-500';
  if (severity <= 6) return 'fill-orange-600/80 hover:fill-orange-500';
  if (severity <= 8) return 'fill-red-600/90 hover:fill-red-500';
  return 'fill-red-700 hover:fill-red-600';
};

export const HumanBodySVG: React.FC<HumanBodyProps> = ({ effects, selectedSystem, onSystemSelect }) => {
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);

  const otherSystemEffects = effects.filter(
    e => !ANATOMICAL_SYSTEMS.some(s => s.toLowerCase() === e.system.toLowerCase())
  );

  const getSystemSeverity = (systemName: string) => {
    const effect = effects.find(e => e.system.toLowerCase() === systemName.toLowerCase());
    return effect ? effect.severity : 0;
  };

  const isSelected = (systemName: string) => {
    return selectedSystem?.toLowerCase() === systemName.toLowerCase();
  };

  const getSeverityAnimation = (severity: number) => {
    if (severity >= 8) return 'animate-pulse [animation-duration:1s]';
    if (severity >= 5) return 'animate-pulse [animation-duration:2s]';
    return '';
  };

  const createProps = (systemName: string) => {
    const severity = getSystemSeverity(systemName);
    return {
      className: `transition-all duration-300 cursor-pointer stroke-gray-600 stroke-[1.5px] outline-none ${getSeverityColor(severity)} ${getSeverityAnimation(severity)} ${isSelected(systemName) ? 'stroke-cyan-400 stroke-[3px] drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]' : 'focus-visible:stroke-cyan-300 focus-visible:stroke-[3px]'}`,
      onClick: () => onSystemSelect(systemName),
      onMouseEnter: () => setHoveredSystem(systemName),
      onMouseLeave: () => setHoveredSystem(null),
      onFocus: () => setHoveredSystem(systemName),
      onBlur: () => setHoveredSystem(null),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSystemSelect(systemName);
        }
      },
      tabIndex: 0,
      role: 'button',
      'aria-label': `${systemName}, severity ${severity} out of 10`,
    };
  };

  return (
    <>
    <div className="relative w-full max-w-sm mx-auto aspect-[1/2.2] bg-gray-950/40 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner border border-gray-800/60">

      {/* Tooltip Header */}
      <div className="absolute top-4 left-0 right-0 flex justify-center h-8 pointer-events-none">
        {hoveredSystem ? (
          <div className="bg-gray-950 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-cyan-500/30 animate-in slide-in-from-bottom-1 fade-in flex items-center gap-1.5">
            {hoveredSystem}
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
            <span className="text-cyan-300/80 font-normal">Score: {getSystemSeverity(hoveredSystem)}</span>
          </div>
        ) : (
          <div className="text-gray-500 text-xs font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Hover organs
          </div>
        )}
      </div>

      <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-md mt-6">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Human Silhouette Outline */}
        <path
          d="M100 20 C120 20, 130 40, 130 65 C130 80, 120 90, 110 95 C135 100, 155 105, 165 140 C175 175, 175 220, 165 260 C155 260, 145 260, 140 240 C135 210, 135 210, 135 210 L135 410 C135 425, 115 425, 110 410 L110 260 L90 260 L90 410 C85 425, 65 425, 65 410 L65 210 C65 210, 65 210, 60 240 C55 260, 45 260, 35 260 C25 220, 25 175, 35 140 C45 105, 65 100, 90 95 C80 90, 70 80, 70 65 C70 40, 80 20, 100 20 Z"
          className="fill-gray-900 stroke-gray-700 stroke-2"
        />

        {/* Brain */}
        <path d="M100 35 C115 35, 120 45, 120 55 C120 65, 110 70, 100 70 C90 70, 80 65, 80 55 C80 45, 85 35, 100 35 Z" {...createProps('Brain')} />

        {/* Eyes */}
        <circle cx="92" cy="58" r="3" {...createProps('Eyes')} className={`${createProps('Eyes').className} fill-cyan-300/80`} />
        <circle cx="108" cy="58" r="3" {...createProps('Eyes')} className={`${createProps('Eyes').className} fill-cyan-300/80`} />

        {/* Lungs */}
        <path d="M85 115 C92 105, 96 125, 96 150 C96 165, 78 165, 72 150 C68 125, 78 115, 85 115 Z" {...createProps('Lungs')} />
        <path d="M115 115 C108 105, 104 125, 104 150 C104 165, 122 165, 128 150 C132 125, 122 115, 115 115 Z" {...createProps('Lungs')} />

        {/* Heart */}
        <path d="M102 135 C108 130, 115 140, 105 155 C95 145, 98 135, 102 135 Z" {...createProps('Heart')} filter="url(#glow)" />

        {/* Liver */}
        <path d="M88 155 C112 148, 128 160, 112 175 C95 170, 82 170, 88 155 Z" {...createProps('Liver')} />

        {/* Stomach */}
        <path d="M118 162 C130 162, 130 178, 112 182 C100 182, 105 168, 118 162 Z" {...createProps('Stomach')} />

        {/* Kidneys */}
        <ellipse cx="85" cy="180" rx="7" ry="12" {...createProps('Kidneys')} />
        <ellipse cx="115" cy="180" rx="7" ry="12" {...createProps('Kidneys')} />

        {/* Intestines */}
        <path d="M78 190 C90 185, 110 185, 122 190 C130 200, 128 215, 115 220 C100 225, 85 220, 75 210 C70 200, 72 195, 78 190 Z" {...createProps('Intestines')} />

        {/* Pancreas (Behind stomach/intestines mostly, making a small shape) */}
        <path d="M95 175 C105 170, 115 172, 120 176 C115 180, 100 182, 95 175 Z" {...createProps('Pancreas')} />

      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5">
        <div className="flex justify-center gap-3 text-[10px] font-semibold text-gray-400 bg-gray-950/70 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-800">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-700 border border-gray-600"></div>Safe</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-600 border border-yellow-500"></div>Low</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-600 border border-orange-500"></div>Mod</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-500"></div>High</div>
        </div>
      </div>
    </div>

    {/* Systems without a dedicated anatomical shape above (e.g. Skin, Blood, Immune System) */}
    {otherSystemEffects.length > 0 && (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {otherSystemEffects.map(effect => (
          <button
            key={effect.system}
            onClick={() => onSystemSelect(effect.system)}
            onMouseEnter={() => setHoveredSystem(effect.system)}
            onMouseLeave={() => setHoveredSystem(null)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-all outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${getSeverityBadgeClass(effect.severity)} ${isSelected(effect.system) ? 'ring-1 ring-cyan-400/70' : ''}`}
          >
            {effect.system}
          </button>
        ))}
      </div>
    )}
    </>
  );
};
