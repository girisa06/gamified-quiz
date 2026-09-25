import React from 'react';

export default function Leaderboard({ onBack }) {
  // Demo data for the 10 PM presentation review
  const leaders = [
    { rank: 1, name: "Giri", avatar: "🐉", elo: 1420, mastery: "94%" },
    { rank: 2, name: "Veda", avatar: "🧙", elo: 1380, mastery: "89%" },
    { rank: 3, name: "Raja", avatar: "🤖", elo: 1310, mastery: "82%" },
    { rank: 4, name: "Guest_99", avatar: "🦁", elo: 1240, mastery: "71%" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🏆 Hall of Champions
        </h2>
        <button
          onClick={onBack}
          className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800"
        >
          ← Back to Arena
        </button>
      </div>

      <div className="space-y-2">
        {leaders.map((p) => (
          <div
            key={p.rank}
            className={`flex items-center justify-between p-3.5 rounded-xl border ${
              p.rank === 1
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`font-mono text-sm w-5 font-bold ${p.rank === 1 ? 'text-amber-400' : 'text-zinc-500'}`}>
                #{p.rank}
              </span>
              <span className="text-2xl">{p.avatar}</span>
              <span className="font-semibold text-sm">{p.name}</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-emerald-400">Mastery: {p.mastery}</span>
              <span className="font-bold text-amber-400">{p.elo} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}