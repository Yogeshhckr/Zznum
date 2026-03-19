/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Settings2, 
  History, 
  Copy, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Check,
  Dices
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryItem {
  id: string;
  numbers: number[];
  timestamp: number;
  config: {
    min: number;
    max: number;
    count: number;
    unique: boolean;
  };
}

export default function App() {
  // Configuration State
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [unique, setUnique] = useState<boolean>(true);
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('none');

  // Result State
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('rng_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('rng_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  const generateNumbers = useCallback(() => {
    setIsGenerating(true);
    
    // Artificial delay for "feel"
    setTimeout(() => {
      const newNumbers: number[] = [];
      const range = max - min + 1;

      if (unique && count > range) {
        alert(`Cannot generate ${count} unique numbers in a range of ${range}.`);
        setIsGenerating(false);
        return;
      }

      if (unique) {
        const pool = Array.from({ length: range }, (_, i) => min + i);
        for (let i = 0; i < count; i++) {
          const randomIndex = Math.floor(Math.random() * pool.length);
          newNumbers.push(pool.splice(randomIndex, 1)[0]);
        }
      } else {
        for (let i = 0; i < count; i++) {
          newNumbers.push(Math.floor(Math.random() * range) + min);
        }
      }

      let sortedNumbers = [...newNumbers];
      if (sort === 'asc') sortedNumbers.sort((a, b) => a - b);
      if (sort === 'desc') sortedNumbers.sort((a, b) => b - a);

      setResults(sortedNumbers);
      
      const historyEntry: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        numbers: sortedNumbers,
        timestamp: Date.now(),
        config: { min, max, count, unique }
      };
      
      setHistory(prev => [historyEntry, ...prev]);
      setIsGenerating(false);
    }, 300);
  }, [min, max, count, unique, sort]);

  const copyToClipboard = () => {
    const text = results.join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your generation history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 mb-6"
          >
            <Dices size={32} />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Random Number Studio
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg max-w-lg mx-auto"
          >
            Generate precise random sequences for games, research, or decision making.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Controls */}
          <main className="lg:col-span-7 space-y-8">
            
            {/* Generator Card */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200/60">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Settings2 size={20} className="text-indigo-600" />
                  Configuration
                </h2>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="lg:hidden text-indigo-600 text-sm font-medium"
                >
                  {showSettings ? 'Hide' : 'Show'} Settings
                </button>
              </div>

              <div className={`space-y-6 ${showSettings ? 'block' : 'hidden lg:block'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Minimum</label>
                    <input 
                      type="number" 
                      value={min}
                      onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Maximum</label>
                    <input 
                      type="number" 
                      value={max}
                      onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Quantity to Generate</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="w-12 text-center font-mono font-bold text-indigo-600 bg-indigo-50 py-1 rounded-md">
                      {count}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => setUnique(!unique)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      unique 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' 
                        : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${unique ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'}`}>
                      {unique && <Check size={10} className="text-white" />}
                    </div>
                    Unique Numbers
                  </button>

                  <div className="flex-1 flex items-center bg-zinc-50 border border-zinc-200 rounded-xl p-1">
                    {(['none', 'asc', 'desc'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSort(s)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-tight rounded-lg transition-all ${
                          sort === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        {s === 'none' ? 'Unsorted' : s === 'asc' ? 'Low-High' : 'High-Low'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={generateNumbers}
                disabled={isGenerating}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} />
                {isGenerating ? 'Generating...' : 'Generate Numbers'}
              </button>
            </section>

            {/* Results Display */}
            <AnimatePresence mode="wait">
              {results.length > 0 && (
                <motion.section 
                  key="results"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200/60"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-semibold">Results</h2>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {results.map((num, idx) => (
                      <motion.div 
                        key={`${num}-${idx}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="min-w-[3.5rem] h-14 flex items-center justify-center bg-indigo-50 text-indigo-700 font-mono text-2xl font-bold rounded-2xl border border-indigo-100 px-4"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </main>

          {/* History Sidebar */}
          <aside className="lg:col-span-5 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200/60 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <History size={20} className="text-indigo-600" />
                  History
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                    title="Clear History"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 space-y-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-center">
                    <History size={48} className="mb-4 opacity-20" />
                    <p className="text-sm">No history yet.<br/>Generate numbers to see them here.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                          {item.config.min}-{item.config.max}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.numbers.slice(0, 10).map((n, i) => (
                          <span key={i} className="text-sm font-mono font-bold text-zinc-600">
                            {n}{i < Math.min(item.numbers.length, 10) - 1 ? ',' : ''}
                          </span>
                        ))}
                        {item.numbers.length > 10 && (
                          <span className="text-xs text-zinc-400 font-medium">+{item.numbers.length - 10} more</span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </aside>

        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-zinc-200 text-center text-zinc-400 text-sm">
          <p>© {new Date().getFullYear()} Random Number Studio. Built for precision.</p>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}} />
    </div>
  );
}
