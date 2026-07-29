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
  if (severity === 0) return 'bg-gray-100 border-gray-200 text-gray-500';
  if (severity <= 3) return 'bg-yellow-200 border-yellow-300 text-yellow-900';
  if (severity <= 6) return 'bg-orange-400 border-orange-500 text-orange-950';
  if (severity <= 8) return 'bg-red-500 border-red-600 text-white';
  return 'bg-red-700 border-red-800 text-white';
};

const getSeverityColor = (severity: number) => {
  if (severity === 0) return 'fill-gray-100 hover:fill-gray-200';
  if (severity <= 3) return 'fill-yellow-200 hover:fill-yellow-300';
  if (severity <= 6) return 'fill-orange-400 hover:fill-orange-500';
  if (severity <= 8) return 'fill-red-500 hover:fill-red-600';
  return 'fill-red-700 hover:fill-red-800';
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
      className: `transition-all duration-300 cursor-pointer stroke-white stroke-[1.5px] ${getSeverityColor(severity)} ${getSeverityAnimation(severity)} ${isSelected(systemName) ? 'stroke-blue-500 stroke-[3px] drop-shadow-lg' : ''}`,
      onClick: () => onSystemSelect(systemName),
      onMouseEnter: () => setHoveredSystem(systemName),
      onMouseLeave: () => setHoveredSystem(null),
    };
  };

  return (
    <>
    <div className="relative w-full max-w-sm mx-auto aspect-[1/2.2] bg-gradient-to-b from-slate-50 to-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center shadow-inner border border-gray-200/50">

      {/* Tooltip Header */}
      <div className="absolute top-4 left-0 right-0 flex justify-center h-8 pointer-events-none">
        {hoveredSystem ? (
          <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md animate-in slide-in-from-bottom-1 fade-in flex items-center gap-1.5">
            {hoveredSystem}
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="text-white/80 font-normal">Score: {getSystemSeverity(hoveredSystem)}</span>
          </div>
        ) : (
          <div className="text-gray-400 text-xs font-medium flex items-center gap-1">
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
          className="fill-white stroke-slate-200 stroke-2" 
        />
        
        {/* Brain */}
        <path d="M100 35 C115 35, 120 45, 120 55 C120 65, 110 70, 100 70 C90 70, 80 65, 80 55 C80 45, 85 35, 100 35 Z" {...createProps('Brain')} />
        
        {/* Eyes */}
        <circle cx="92" cy="58" r="3" {...createProps('Eyes')} className={`${createProps('Eyes').className} fill-blue-100`} />
        <circle cx="108" cy="58" r="3" {...createProps('Eyes')} className={`${createProps('Eyes').className} fill-blue-100`} />

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
        <div className="flex justify-center gap-3 text-[10px] font-semibold text-gray-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-200"></div>Safe</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-200 border border-yellow-300"></div>Low</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400 border border-orange-500"></div>Mod</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-600"></div>High</div>
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
            className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all ${getSeverityBadgeClass(effect.severity)} ${isSelected(effect.system) ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
          >
            {effect.system}
          </button>
        ))}
      </div>
    )}
    </>
  );
};
