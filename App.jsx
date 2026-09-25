import React, { useState } from 'react';
import JoinScreen from './src/JoinScreen';
import HomeScreen from './src/HomeScreen';
import TrackSelector from './TrackSelector';
import AnswerCard from './AnswerCard';
import Leaderboard from './src/Leaderboard';
import DevOverlay from './src/DevOverlay';

// Sample fallback questions if API is still generating
const SAMPLE_QUESTIONS = [
  {
    id: 1,
    q: "Which gas is released during photosynthesis?",
    options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
    answer: 1,
    difficulty: "easy"
  },
  {
    id: 2,
    q: "What is the powerhouse of the cell?",
    options: ["Ribosome", "Nucleus", "Mitochondria", "Chloroplast"],
    answer: 2,
    difficulty: "medium"
  }
];

export default function App() {
  const [view, setView] = useState('join'); // 'join' | 'home' | 'track' | 'quiz' | 'leaderboard'
  const [user, setUser] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS);
  const [isGenerating, setIsGenerating] = useState(false);

  // Live game telemetry shown in DevOverlay
  const [stats, setStats] = useState({
    topic: "General Science",
    masteryScore: 0.65,
    elo: 1200,
    difficulty: "Medium",
    streak: 0
  });

  const handleJoin = (userData) => {
    setUser(userData);
    setView('home');
  };

  const handleSelectNCERT = (opts) => {
    setStats((s) => ({ ...s, topic: `${opts.subject} - ${opts.chapter}` }));
    setQIndex(0);
    setView('quiz');
  };

  const handleUploadPDF = (file) => {
    setIsGenerating(true);
    // Member 3 / Member 1 PDF endpoint integration:
    setTimeout(() => {
      setIsGenerating(false);
      setStats((s) => ({ ...s, topic: file.name.replace('.pdf', '') }));
      setQIndex(0);
      setView('quiz');
    }, 1500);
  };

  const handleAnswer = (optionIdx, isCorrect) => {
    setStats((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const masteryDelta = isCorrect ? 0.08 : -0.05;
      const newMastery = Math.max(0.1, Math.min(0.99, prev.masteryScore + masteryDelta));
      const nextDiff = newStreak >= 2 ? "Hard" : isCorrect ? "Medium" : "Easy";

      return {
        ...prev,
        streak: newStreak,
        masteryScore: newMastery,
        difficulty: nextDiff,
        elo: prev.elo + (isCorrect ? 16 : -10)
      };
    });

    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
    } else {
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {view === 'join' && <JoinScreen onJoin={handleJoin} />}
      {view === 'home' && (
        <HomeScreen
          user={user}
          stats={stats}
          onStartSolo={() => setView('track')}
          onOpenLeaderboard={() => setView('leaderboard')}
        />
      )}
      {view === 'track' && (
        <div className="py-6">
          <button
            onClick={() => setView('home')}
            className="block max-w-2xl mx-auto px-6 mb-2 text-xs text-zinc-400 hover:text-white"
          >
            ← Back to Home
          </button>
          <TrackSelector
            onSelectNCERT={handleSelectNCERT}
            onUploadPDF={handleUploadPDF}
            isGenerating={isGenerating}
          />
        </div>
      )}
      {view === 'quiz' && (
        <div className="max-w-xl mx-auto p-4 pt-12">
          <div className="flex justify-between items-center text-xs text-zinc-400 mb-3 font-mono">
            <span>Question {qIndex + 1} of {questions.length}</span>
            <span className="text-amber-400">Streak: {stats.streak} 🔥</span>
          </div>
          <AnswerCard
            question={questions[qIndex]}
            onAnswer={handleAnswer}
          />
        </div>
      )}
      {view === 'leaderboard' && (
        <Leaderboard onBack={() => setView('home')} />
      )}

      {/* Judge Requirement: Floating Overlay available on all views */}
      <DevOverlay stats={stats} />
    </div>
  );
}