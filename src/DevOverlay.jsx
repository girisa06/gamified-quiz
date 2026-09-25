import React, { useState } from 'react';

export default function DevOverlay({ stats }) {
  const [isOpen, setIsOpen] = useState(false);

  // Fallback defaults if endpoints are still settling
  const {
    topic = "Science Basics",
    masteryScore = 0.65,
    elo = 1200,
    difficulty = "Medium",
    streak = 0
  } = stats || {};

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-900 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-full shadow-lg hover:bg-zinc-800 transition-all flex items-center gap-1.5"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        {isOpen ? "Close Dev HUD" : "🛠️ Dev HUD"}
      </button>

      {isOpen && (
        <div className="mt-2 w-72 bg-zinc-950/95 text-zinc-100 p-4 rounded-xl border border-zinc-700 shadow-2xl backdrop-blur-md">
          <div className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-2 border-b border-zinc-850 pb-1">
            Live Telemetry Engine
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-zinc-300">
                <span>Topic Mastery (BKT):</span>
                <span className="font-bold text-emerald-400">{(masteryScore * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(masteryScore * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Elo Matchmaking:</span>
              <span className="font-bold text-amber-400">{Math.round(elo)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Next Question Diff:</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                difficulty === 'Hard' ? 'bg-red-950 text-red-400 border border-red-800' :
                difficulty === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {difficulty.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Current Streak:</span>
              <span className="text-cyan-400 font-bold">{streak} 🔥</span>
            </div>
            
            <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-850">
              Active Topic: <span className="text-zinc-300">{topic}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}