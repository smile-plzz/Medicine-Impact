/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Clock } from 'lucide-react';
import { MedicineDashboard } from './components/MedicineDashboard';
import { MedicineData } from './types';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MedicineData | null>(null);
  const [history, setHistory] = useState<{query: string, created_at: string}[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const h = await res.json();
        setHistory(h);
      }
    } catch (e) {
      console.error("Could not fetch history");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/medicine/${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medicine data');
      }
      const result = await response.json();
      setData(result);
      fetchHistory(); // Refresh history
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 text-gray-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-display font-bold text-lg tracking-tight shrink-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <span className="text-black text-xs font-bold font-mono">MI</span>
            </div>
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              MEDICINE IMPACT
            </span>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicine, interaction (+), or compare (vs)..."
              className="w-full bg-gray-900/50 border border-gray-700/50 text-gray-200 font-mono text-sm rounded focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 block pl-10 pr-10 p-2.5 transition-all outline-none placeholder:text-gray-600 shadow-inner"
              disabled={loading}
            />
            {query && !loading && (
              <button 
                type="button"
                onClick={() => { setQuery(''); setData(null); setError(null); }}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-cyan-400 transition-colors"
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </nav>

      <main className="flex-1 py-8 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {loading && (
          <div className="flex flex-col items-center justify-center mt-32 space-y-6 animate-in fade-in relative z-10">
            <div className="w-16 h-16 rounded bg-gray-900 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
            <p className="text-cyan-400/80 font-mono text-sm animate-pulse uppercase tracking-widest">Synthesizing Data...</p>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto mt-20 p-6 bg-red-950/30 text-red-400 rounded-lg border border-red-900/50 text-center animate-in fade-in slide-in-from-bottom-4 backdrop-blur-sm relative z-10">
            <p className="font-display font-semibold mb-2 uppercase tracking-wide">Analysis Failed</p>
            <p className="text-sm opacity-80 font-mono">{error}</p>
          </div>
        )}

        {!loading && !error && !data && (
          <div className="max-w-2xl mx-auto mt-32 text-center px-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 drop-shadow-lg">
              SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">INITIALIZED</span>.
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto font-mono text-sm leading-relaxed">
              &gt; ENTER SUBSTANCE DESIGNATION TO INITIATE BIO-IMPACT SIMULATION. MULTIPLE INPUTS ACCEPTED FOR INTERACTION ANALYSIS.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {['Ibuprofen', 'Lisinopril + Advil', 'Sertraline', 'Adderall'].map((med) => (
                <button
                  key={med}
                  onClick={() => { setQuery(med); handleSearch({ preventDefault: () => {} } as any); }}
                  className="px-5 py-2 rounded bg-gray-900/50 border border-gray-700/50 text-xs font-mono text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all shadow-sm cursor-pointer uppercase tracking-wider hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                >
                  {med}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <div className="text-left max-w-md mx-auto">
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Recent Queries
                </h3>
                <div className="bg-gray-900/30 rounded border border-gray-800/80 overflow-hidden shadow-inner">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(h.query); handleSearch({ preventDefault: () => {} } as any); }}
                      className={`w-full text-left px-4 py-3 text-sm font-mono text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-colors ${i !== history.length - 1 ? 'border-b border-gray-800/50' : ''} flex justify-between items-center`}
                    >
                      <span className="capitalize">{h.query}</span>
                      <span className="text-[10px] text-gray-600 tracking-wider">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && data && (
          <div className="relative z-10">
            <MedicineDashboard data={data} />
          </div>
        )}
      </main>
      
      {/* Disclaimer */}
      <footer className="py-8 text-center text-[10px] font-mono text-gray-600 px-4 max-w-3xl mx-auto mt-auto uppercase tracking-widest relative z-10">
        // EDUCATIONAL USE ONLY // NOT FOR MEDICAL DIAGNOSIS // CONSULT QUALIFIED PROFESSIONALS
      </footer>
    </div>
  );
}
