import React, { useState } from 'react';

export default function AnswerCard({ question, onAnswer, userAvatar = "🐉" }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  // Shift distance in pixels: Correct pulls LEFT (-55px), Wrong pulls RIGHT (+55px)
  const ropeShift = feedback === 'correct' ? -55 : feedback === 'wrong' ? 55 : 0;

  const handleOptionClick = (idx) => {
    if (feedback) return; // Prevent double taps during animation
    setSelectedIdx(idx);

    const isCorrect = idx === question.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    // 1000ms delay to let the tug animation play cleanly before next question
    setTimeout(() => {
      onAnswer(idx, isCorrect);
      setFeedback(null);
      setSelectedIdx(null);
    }, 1000);
  };

  return (
    <>
      <style>{`
        @keyframes strainPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15) rotate(-4deg); }
        }
        .pull-strain-left {
          animation: strainPulse 0.3s ease-in-out infinite;
        }
        @keyframes strainPulseRight {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15) rotate(4deg); }
        }
        .pull-strain-right {
          animation: strainPulseRight 0.3s ease-in-out infinite;
        }
      `}</style>

      <div className="space-y-4">
        {/* ================= TUG OF WAR BATTLE ARENA ================= */}
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-hidden shadow-xl">
          {/* Header & Status Indicator */}
          <div className="flex justify-between items-center text-xs font-mono mb-2 text-zinc-400">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <span>YOU</span>
              {feedback === 'correct' && (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-bold animate-pulse">
                  PULLING!
                </span>
              )}
            </span>
            <span className="text-zinc-500 text-[11px] font-bold tracking-widest uppercase">
              {feedback === 'correct' ? "🔥 CRITICAL PULL!" : feedback === 'wrong' ? "⚠️ BOT GAINING GROUND!" : "⚔️ TUG OF WAR"}
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              {feedback === 'wrong' && (
                <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded font-bold animate-pulse">
                  PULLING!
                </span>
              )}
              <span>PRACTICE BOT</span>
            </span>
          </div>

          {/* Pit / Center Ground Marker */}
          <div className="relative h-20 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-center justify-between px-6 overflow-hidden">
            {/* Center Midline Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-dashed bg-zinc-700/60 -translate-x-1/2 z-0" />
            <div className="absolute left-1/2 top-1 -translate-x-1/2 text-[9px] text-zinc-600 font-mono tracking-widest z-0">
              MIDLINE
            </div>

            {/* --- PLAYER FIGHTER (Left) --- */}
            <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
              feedback === 'correct' 
                ? '-translate-x-5 pull-strain-left scale-110' 
                : feedback === 'wrong' 
                ? 'translate-x-4 opacity-50 scale-95' 
                : ''
            }`}>
              <div className="text-3xl drop-shadow-md select-none transform -scale-x-100">
                {userAvatar}
              </div>
              <span className="text-[10px] text-indigo-300 font-mono mt-0.5">Player</span>
            </div>

            {/* --- MOVING ROPE & TIE RIBBON --- */}
            <div className="flex-1 mx-3 relative flex items-center h-4">
              {/* Rope line */}
              <div className="w-full h-2 bg-amber-700/80 rounded-full border border-amber-500/50 shadow-inner relative overflow-hidden">
                <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,#000,#000_3px,transparent_3px,transparent_6px)]" />
              </div>

              {/* Knot Indicator: Cleanly shifts without class conflict */}
              <div
                className="absolute top-1/2 left-1/2 transition-transform duration-700 ease-out z-20 flex flex-col items-center pointer-events-none"
                style={{ transform: `translate(calc(-50% + ${ropeShift}px), -50%)` }}
              >
                <div className={`w-3.5 h-3.5 rotate-45 rounded-xs transition-colors duration-300 shadow-md ${
                  feedback === 'correct' ? 'bg-emerald-400 ring-2 ring-emerald-300 scale-125' :
                  feedback === 'wrong' ? 'bg-rose-500 ring-2 ring-rose-300 scale-125' :
                  'bg-red-500'
                }`} />
                <span className="text-[8px] font-mono mt-1 font-bold text-zinc-300 select-none">
                  {feedback === 'correct' ? "◄ +XP" : feedback === 'wrong' ? "-XP ►" : "▼"}
                </span>
              </div>
            </div>

            {/* --- BOT OPPONENT (Right) --- */}
            <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
              feedback === 'wrong' 
                ? 'translate-x-5 pull-strain-right scale-110' 
                : feedback === 'correct' 
                ? '-translate-x-4 opacity-50 scale-95' 
                : ''
            }`}>
              <div className="text-3xl drop-shadow-md select-none">
                🤖
              </div>
              <span className="text-[10px] text-rose-300 font-mono mt-0.5">Rival Bot</span>
            </div>
          </div>
        </div>

        {/* ================= QUESTION CARD ================= */}
        <div className={`relative p-6 rounded-2xl bg-zinc-900 border transition-all duration-300 ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-950/20 shadow-lg shadow-rose-500/10'
            : 'border-zinc-800'
        }`}>
          <h3 className="text-lg font-bold text-white mb-6 leading-relaxed">
            {question.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              let btnStyle = "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 cursor-pointer";

              if (selectedIdx === idx) {
                btnStyle = feedback === 'correct'
                  ? "bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 scale-[1.01]"
                  : "bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300 scale-[0.99]";
              } else if (feedback === 'wrong' && idx === question.answer) {
                btnStyle = 'border-dashed border-2 border-emerald-500 bg-emerald-950/20 text-emerald-300';
              }

              return (
                <button
                  key={idx}
                  disabled={!!feedback}
                  onClick={() => handleOptionClick(idx)}
                  className={`p-3.5 rounded-xl border text-left font-medium text-sm transition-all duration-150 ${btnStyle}`}
                >
                  <span className="inline-block w-6 text-zinc-400 font-mono text-xs">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}