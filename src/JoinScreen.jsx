import React, { useState } from 'react';

const AVATARS = ['🐉', '🤖', '🧙', '🦁', '🚀', '⚡'];

export default function JoinScreen({ onJoin }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin({ code: code.toUpperCase() || 'DEMO', name: name.trim(), avatar });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Quiz Duel ⚔️</h1>
          <p className="text-zinc-400 text-sm mt-1">Pick your fighter & join the battle arena</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">YOUR AVATAR</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`text-2xl p-2 rounded-xl border text-center transition-all ${
                    avatar === av
                      ? 'border-indigo-500 bg-indigo-950/40 scale-105'
                      : 'border-zinc-800 bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">DISPLAY NAME</label>
            <input
              type="text"
              required
              placeholder="e.g. MasterCoder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">CLASS CODE (4 Letters)</label>
            <input
              type="text"
              maxLength={4}
              placeholder="DEMO"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2.5 uppercase font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all"
          >
            Enter Arena 🚀
          </button>
        </form>
      </div>
    </div>
  );
}