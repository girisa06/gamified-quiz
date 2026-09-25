import React from 'react';

export default function HomeScreen({ user, stats, onStartSolo, onOpenLeaderboard }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-2xl mx-auto space-y-6">
      {/* Top Banner / Avatar Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-5xl bg-zinc-800 p-3 rounded-2xl border border-zinc-700">
            {user.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">
                Elo: {Math.round(stats?.elo || 1200)}
              </span>
              <span className="text-xs text-zinc-400">Class: {user.code || 'DEMO'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenLeaderboard}
          className="text-xs font-semibold px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all"
        >
          🏆 Hall of Fame
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onStartSolo}
          className="p-6 bg-gradient-to-br from-indigo-950/60 to-zinc-900 border border-indigo-600/40 rounded-2xl text-left hover:border-indigo-500 transition-all group"
        >
          <span className="text-3xl mb-2 block">🎯</span>
          <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
            Start Practice Quiz
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Choose NCERT curriculum or upload your own PDF notes.</p>
        </button>

        <button
          onClick={() => alert("Waiting for friend lobby... (Share code: " + (user.code || 'DEMO') + ")")}
          className="p-6 bg-gradient-to-br from-purple-950/60 to-zinc-900 border border-purple-600/40 rounded-2xl text-left hover:border-purple-500 transition-all group"
        >
          <span className="text-3xl mb-2 block">⚔️</span>
          <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
            Challenge a Friend
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Asynchronous duel: challenge classmates and climb rankings.</p>
        </button>
      </div>
    </div>
  );
}