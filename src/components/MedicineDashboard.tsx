import React, { useState } from 'react';
import { MedicineData } from '../types';
import { HumanBodySVG } from './HumanBodySVG';
import { Activity, AlertTriangle, Info, ShieldAlert, FileText, Pill, Clock, Download, Printer } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { exportToMarkdown } from '../lib/export';

export const MedicineDashboard: React.FC<{ data: MedicineData }> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'body' | 'interactions' | 'timeline' | 'overdose'>('overview');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [persona, setPersona] = useState<'patient' | 'student' | 'doctor' | 'researcher'>('patient');

  const riskData = [
    { name: 'Liver', risk: getRiskScore(data.riskClassifications.liverToxicity.level), info: data.riskClassifications.liverToxicity },
    { name: 'Kidney', risk: getRiskScore(data.riskClassifications.kidneyToxicity.level), info: data.riskClassifications.kidneyToxicity },
    { name: 'Heart', risk: getRiskScore(data.riskClassifications.cardiacRisk.level), info: data.riskClassifications.cardiacRisk },
    { name: 'Pregnancy', risk: getRiskScore(data.riskClassifications.pregnancyRisk.level), info: data.riskClassifications.pregnancyRisk },
    { name: 'Addiction', risk: getRiskScore(data.riskClassifications.addictionPotential.level), info: data.riskClassifications.addictionPotential },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Card */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-[0_0_20px_rgba(34,211,238,0.05)] border border-cyan-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2 hidden md:flex">
          <button 
            onClick={() => window.print()}
            className="p-2 text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-all"
            title="Print Report"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={() => exportToMarkdown(data)}
            className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            title="Export as Markdown"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-8 md:pt-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display pr-16 md:pr-0 uppercase drop-shadow-md">
              {data.summary.genericName}
            </h1>
            <span className="px-3 py-1 bg-cyan-950 border border-cyan-500/50 text-cyan-400 text-[10px] font-mono uppercase tracking-widest rounded shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              {data.summary.drugClass}
            </span>
          </div>
          <p className="text-gray-400 text-sm font-mono tracking-wide">
            ALIASES: <span className="text-gray-300">{data.summary.brandNames.join(' // ')}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto font-mono">
           <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
             <div className="flex items-center gap-2 text-cyan-500/70 text-[10px] uppercase tracking-widest mb-1">
               <Clock className="w-3 h-3" /> HALF-LIFE
             </div>
             <div className="font-medium text-gray-200 text-sm">{data.summary.halfLife || 'UNKNOWN'}</div>
           </div>
           <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
             <div className="flex items-center gap-2 text-cyan-500/70 text-[10px] uppercase tracking-widest mb-1">
               <ShieldAlert className="w-3 h-3" /> PREGNANCY
             </div>
             <div className="font-medium text-gray-200 text-sm">CAT: {data.summary.pregnancyCategory || 'UNKNOWN'}</div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-gray-900/60 rounded border border-gray-800 w-fit">
        {(['overview', 'body', 'interactions', 'timeline', 'overdose'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded text-xs font-mono uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] border border-cyan-500/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 border border-transparent'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visuals / Charts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900/40 rounded-xl p-6 shadow-sm border border-gray-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <Activity className="w-32 h-32 text-cyan-500" />
             </div>
             <h3 className="text-sm font-mono text-cyan-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
               <Activity className="w-4 h-4" /> BIO-METRIC MAP
             </h3>
              <HumanBodySVG 
                effects={data.bodySystemEffects} 
                selectedSystem={selectedSystem} 
                onSystemSelect={(sys) => {
                  setSelectedSystem(sys);
                  setActiveTab('body');
                }} 
              />
             <p className="text-[10px] font-mono text-center text-gray-500 mt-4 uppercase tracking-widest">&gt; SELECT SUBSYSTEM FOR DIAGNOSTICS</p>
          </div>
          
          {activeTab === 'overview' && (
            <div className="bg-gray-900/40 rounded-xl p-6 shadow-sm border border-gray-800">
              <h3 className="text-sm font-mono text-orange-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4" /> RISK PROFILE MATRIX
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 4]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'monospace' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-gray-950 p-4 border border-gray-800 shadow-2xl rounded max-w-xs font-mono">
                              <p className="text-xs font-bold text-gray-200 mb-2 uppercase tracking-wider">{data.name} RISK: <span className="text-cyan-400">{data.info.level}</span></p>
                              <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{data.info.reasoning}</p>
                              <div className="w-full bg-gray-800 rounded-full h-1 mb-1 overflow-hidden">
                                <div className="bg-cyan-500 h-1 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" style={{ width: `${data.info.confidence}%` }}></div>
                              </div>
                              <p className="text-[9px] text-gray-500 text-right tracking-widest">CONFIDENCE: {data.info.confidence}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={12}>
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Content based on Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'overview' && (
            <>
              <div className="bg-cyan-950/20 rounded-xl p-6 border border-cyan-900/50 relative shadow-[inset_0_0_20px_rgba(34,211,238,0.02)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
                    <Info className="w-4 h-4" /> SYNTHESIS PROTOCOL
                  </h3>
                  <div className="flex bg-gray-950/80 p-1 rounded border border-gray-800 overflow-x-auto max-w-full">
                    {(['patient', 'student', 'doctor', 'researcher'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPersona(p)}
                        className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded transition-all whitespace-nowrap ${persona === p ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-950/50 p-5 rounded border border-gray-800 shadow-inner">
                  <p className="text-gray-300 leading-relaxed text-sm font-sans">
                    {data.educational[persona]}
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/40 rounded-xl p-6 shadow-sm border border-gray-800">
                <h3 className="text-sm font-mono text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <Pill className="w-4 h-4" /> MECHANISM OF ACTION
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm font-sans">
                  {data.summary.mechanism}
                </p>
              </div>
            </>
          )}

          {activeTab === 'body' && (
            <div className="bg-gray-900/40 rounded-xl p-6 shadow-sm border border-gray-800 min-h-[500px] relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity className="w-48 h-48 text-cyan-500" />
              </div>
              <h3 className="text-sm font-mono text-cyan-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                SYSTEM DIAGNOSTICS
              </h3>
              
              {!selectedSystem ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 py-20 font-mono text-sm uppercase tracking-widest">
                  <Activity className="w-12 h-12 opacity-20 text-cyan-500" />
                  <p>&gt; AWAITING SUBSYSTEM SELECTION</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300 relative z-10">
                  {(() => {
                    const effect = data.bodySystemEffects.find(e => e.system.toLowerCase() === selectedSystem.toLowerCase());
                    if (!effect) return <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">&gt; NO DATA FOR {selectedSystem}</p>;
                    
                    return (
                      <>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                          <h4 className="text-2xl font-display font-bold text-white uppercase tracking-wider">{effect.system}</h4>
                          <span className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest border ${
                            effect.severity > 7 ? 'bg-red-950/50 text-red-400 border-red-900/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]' :
                            effect.severity > 4 ? 'bg-orange-950/50 text-orange-400 border-orange-900/50 shadow-[0_0_10px_rgba(251,146,60,0.2)]' :
                            effect.severity > 0 ? 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50' : 'bg-gray-800/50 text-gray-400 border-gray-700'
                          }`}>
                            RISK LEVEL: {effect.severity}/10
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-gray-950/50 p-5 rounded border border-gray-800">
                             <h5 className="font-mono text-[10px] text-green-400 mb-4 uppercase tracking-widest">POSITIVE EFFECTS</h5>
                             <ul className="space-y-3">
                               {effect.positiveEffects.length > 0 ? effect.positiveEffects.map((e, i) => (
                                 <li key={i} className="text-gray-300 text-sm flex items-start gap-3">
                                   <span className="text-green-500 mt-0.5 font-mono text-[10px]">&gt;</span> {e}
                                 </li>
                               )) : <li className="text-gray-600 text-sm italic font-mono text-[10px]">&gt; NULL</li>}
                             </ul>
                           </div>
                           <div className="bg-gray-950/50 p-5 rounded border border-gray-800">
                             <h5 className="font-mono text-[10px] text-orange-400 mb-4 uppercase tracking-widest">ADVERSE EFFECTS</h5>
                             <ul className="space-y-3">
                               {effect.negativeEffects.map((e, i) => (
                                 <li key={i} className="text-gray-300 text-sm flex items-start gap-3">
                                   <span className="text-orange-500 mt-0.5 font-mono text-[10px]">&gt;</span> {e}
                                 </li>
                               ))}
                             </ul>
                           </div>
                        </div>

                        <div className="bg-blue-950/20 rounded p-5 border border-blue-900/30">
                          <h5 className="font-mono text-[10px] text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <Info className="w-3 h-3" /> EVIDENCE LOG
                          </h5>
                          <p className="text-sm text-gray-300 mb-4 leading-relaxed">{effect.reasoning}</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">SRC:</span>
                            {effect.sources?.map((src, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 text-gray-400 text-[9px] rounded font-mono uppercase tracking-widest">
                                {src}
                              </span>
                            ))}
                          </div>
                        </div>

                        {(effect.seriousRisks?.length > 0 || effect.commonSideEffects?.length > 0) && (
                          <div className="bg-red-950/20 rounded p-5 border border-red-900/30">
                             <h5 className="font-mono text-[10px] text-red-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                               <AlertTriangle className="w-3 h-3" /> CRITICAL WARNINGS
                             </h5>
                             <ul className="space-y-3">
                               {effect.seriousRisks.map((e, i) => (
                                 <li key={i} className="text-red-200/90 text-sm flex items-start gap-3">
                                   <span className="text-red-500 mt-0.5 font-mono text-[10px] font-bold">!</span> {e}
                                 </li>
                               ))}
                             </ul>
                             <div className="mt-5 pt-4 border-t border-red-900/50">
                               <p className="text-sm text-red-300/80 font-mono"><span className="text-[10px] text-red-500 uppercase tracking-widest mr-2">MONITOR:</span> {effect.monitoring}</p>
                             </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="bg-gray-900/40 rounded-xl p-6 shadow-sm border border-gray-800">
              <h3 className="text-sm font-mono text-cyan-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <FileText className="w-4 h-4" /> CROSS-REACTIONS
              </h3>
              <div className="space-y-4">
                {data.interactions?.map((interaction, i) => (
                  <div key={i} className={`p-5 rounded border ${
                    interaction.severity === 'Major' ? 'bg-red-950/30 border-red-900/50 shadow-[inset_0_0_20px_rgba(248,113,113,0.05)]' :
                    interaction.severity === 'Moderate' ? 'bg-orange-950/30 border-orange-900/50' :
                    'bg-gray-950/50 border-gray-800'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-900 rounded text-[9px] font-mono uppercase tracking-widest border border-gray-700 text-gray-400">
                          {interaction.type}
                        </span>
                        <span className="font-display font-bold text-white tracking-wide">{interaction.interactingSubstance}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded ${
                        interaction.severity === 'Major' ? 'bg-red-500/20 text-red-400' :
                        interaction.severity === 'Moderate' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {interaction.severity}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed font-sans">{interaction.description}</p>
                  </div>
                ))}
                {(!data.interactions || data.interactions.length === 0) && (
                  <p className="text-gray-500 font-mono text-sm uppercase tracking-widest text-center py-10">&gt; NO MAJOR CROSS-REACTIONS DETECTED</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-gray-900/40 rounded-xl p-6 shadow-sm border border-gray-800 relative overflow-hidden">
               <h3 className="text-sm font-mono text-cyan-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
                <Clock className="w-4 h-4" /> TEMPORAL PROGRESSION
              </h3>
              <div className="relative border-l border-gray-800 ml-4 space-y-8 pb-4">
                {data.detailedTimeline?.map((stage, i) => (
                  <TimelineItem 
                    key={i} 
                    title={stage.stage} 
                    content={stage.description} 
                    icon={i === 0 ? "⚡" : i === data.detailedTimeline.length - 1 ? "📉" : "⏳"} 
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overdose' && (
            <div className="bg-red-950/20 rounded-xl p-6 border border-red-900/50 shadow-[inset_0_0_30px_rgba(248,113,113,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <AlertTriangle className="w-48 h-48 text-red-500" />
              </div>
              <h3 className="text-sm font-mono text-red-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4" /> TOXICITY ALERT
              </h3>
              <div className="mb-8 pb-6 border-b border-red-900/50 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-red-500">RISK MAGNITUDE:</span>
                  <span className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded ${data.overdose.severity === 'Critical' || data.overdose.severity === 'High' ? 'bg-red-600/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
                    {data.overdose.severity}
                  </span>
                </div>
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-4">SYMPTOMATOLOGY</h4>
                <ul className="space-y-2 text-red-200/80 text-sm font-sans">
                  {data.overdose.symptoms?.map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-red-500 mt-0.5 font-mono text-[10px]">&gt;</span> {sym}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative z-10">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-3">EMERGENCY PROTOCOL</h4>
                <p className="text-red-200 text-sm leading-relaxed font-sans mb-6">
                  {data.overdose.actionToTake}
                </p>
                <div className="p-4 bg-red-950/50 rounded border border-red-900/50 animate-pulse">
                  <p className="text-xs text-red-400 font-mono font-bold uppercase tracking-widest text-center">
                    !!! SEEK IMMEDIATE MEDICAL ATTENTION !!!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const TimelineItem: React.FC<{ title: string, content: string, icon: string, isLast?: boolean }> = ({ title, content, icon, isLast = false }) => (
  <div className="relative pl-8">
    <div className="absolute -left-[17px] top-1 w-8 h-8 bg-gray-950 border border-cyan-900/50 rounded flex items-center justify-center text-sm shadow-[0_0_10px_rgba(34,211,238,0.1)] text-cyan-400">
      {icon}
    </div>
    <h4 className="text-sm font-mono font-bold text-cyan-100 mb-2 uppercase tracking-widest">{title}</h4>
    <p className="text-gray-400 text-sm leading-relaxed font-sans">{content}</p>
  </div>
);

const getRiskScore = (level: string) => {
  const map: Record<string, number> = { 'Safe': 0, 'Low': 1, 'Moderate': 2, 'High': 3, 'Critical': 4 };
  return map[level] || 0;
};

const getRiskColor = (score: number) => {
  // Vibrant neon colors
  const colors = ['#2DD4BF', '#FBBF24', '#FB923C', '#F87171', '#E11D48']; // Teal, Yellow, Orange, Light Red, Rose/Crimson
  return colors[score] || colors[0];
};
