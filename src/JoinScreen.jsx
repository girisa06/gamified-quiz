import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Swords, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sun, 
  Moon, 
  Trophy, 
  BarChart2, 
  BookOpen, 
  Medal,
  ArrowRight
} from 'lucide-react';

const AVATARS = [
  { id: 'snake', emoji: '🐍', name: 'Viper' },
  { id: 'robot', emoji: '🤖', name: 'Bot' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Mage' },
  { id: 'lion', emoji: '🦁', name: 'Leo' },
  { id: 'rocket', emoji: '🚀', name: 'Astro' },
  { id: 'phoenix', emoji: '🔥', name: 'Phoenix' },
];

export default function JoinScreen({ onEnterArena }) {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [classCode, setClassCode] = useState('DEMO');

  const handleNextAvatar = () => {
    setSelectedAvatar((prev) => (prev + 1) % AVATARS.length);
  };

  const handlePrevAvatar = () => {
    setSelectedAvatar((prev) => (prev - 1 + AVATARS.length) % AVATARS.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim()) return alert('Please enter your display name!');
    if (!classCode.trim()) return alert('Please enter a 4-letter class code!');
    
    if (onEnterArena) {
      onEnterArena({
        avatar: AVATARS[selectedAvatar],
        name: displayName.trim(),
        code: classCode.trim().toUpperCase()
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#060a17] text-white flex flex-col justify-between font-sans select-none relative overflow-x-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Swords className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100">Quiz Duel</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
          <a href="#how" className="hover:text-slate-200 transition-colors">How to Play</a>
          <a href="#leaderboard" className="hover:text-slate-200 transition-colors">Leaderboard</a>
          <a href="#about" className="hover:text-slate-200 transition-colors">About</a>
          
          <div className="flex items-center bg-[#0d1428] border border-slate-800 rounded-full p-1 gap-1">
            <button className="p-1 rounded-full text-amber-400 hover:bg-slate-800 transition-all">
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-full text-slate-500 hover:text-slate-300 transition-all">
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center relative z-10">
        
        {/* Title Tagline */}
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400 block mb-1">
            Knowledge Meets Battle
          </span>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Quiz Duel
            </h1>
            <Swords className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Pick your fighter and join the arena.
          </p>
        </div>

        {/* Glassmorphic Registration Card */}
        <div className="w-full bg-[#0c1328]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Step 1: Avatar Selector */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-[11px] font-bold flex items-center justify-center text-white">
                  1
                </span>
                <span className="text-xs font-semibold text-slate-200">Choose Your Avatar</span>
              </div>

              <div className="flex items-center justify-between gap-1 px-1">
                <button 
                  type="button" 
                  onClick={handlePrevAvatar}
                  className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 md:gap-3 flex-1 overflow-x-auto py-1">
                  {AVATARS.map((av, idx) => {
                    const isSelected = selectedAvatar === idx;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(idx)}
                        className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#152042] border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105'
                            : 'bg-[#0f1730]/60 border border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span>{av.emoji}</span>
                        {isSelected && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button 
                  type="button" 
                  onClick={handleNextAvatar}
                  className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step 2: Display Name Input */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-[11px] font-bold flex items-center justify-center text-white">
                  2
                </span>
                <span className="text-xs font-semibold text-slate-200">Set Your Display Name</span>
              </div>

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MasterCoder"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#080d1e] border border-slate-800/90 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Step 3: Class Code Input */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-[11px] font-bold flex items-center justify-center text-white">
                  3
                </span>
                <span className="text-xs font-semibold text-slate-200">Enter Class Code (4 Letters)</span>
              </div>

              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="DEMO"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#080d1e] border border-slate-800/90 rounded-xl py-3 pl-10 pr-4 text-xs font-bold tracking-wider text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 uppercase transition-all"
                />
              </div>
            </div>

            {/* Submit / Enter Arena Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Enter Arena</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </form>
        </div>
      </main>

      {/* Footer Feature Badges */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="bg-[#0b1226]/60 border border-slate-800/70 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Live Battles</p>
              <p className="text-[10px] text-slate-500">Compete in real-time</p>
            </div>
          </div>

          <div className="bg-[#0b1226]/60 border border-slate-800/70 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Leaderboard</p>
              <p className="text-[10px] text-slate-500">Climb the ranks</p>
            </div>
          </div>

          <div className="bg-[#0b1226]/60 border border-slate-800/70 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Learn & Practice</p>
              <p className="text-[10px] text-slate-500">Edutech content across subjects</p>
            </div>
          </div>

          <div className="bg-[#0b1226]/60 border border-slate-800/70 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <Medal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Earn Badges</p>
              <p className="text-[10px] text-slate-500">Show your progress</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}