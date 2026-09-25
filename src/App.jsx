import React, { useState } from 'react';
import JoinScreen from './JoinScreen';
import HomeScreen from './HomeScreen';
import TrackSelector from './TrackSelector';
import AnswerCard from './AnswerCard';
import Leaderboard from './Leaderboard';
import DevOverlay from './DevOverlay';
import * as api from './api';

// Full 10-Question Curriculum Demo Set
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    q: "Which gas do plants absorb during photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    answer: 1,
    difficulty: "easy"
  },
  {
    id: 2,
    q: "What is the powerhouse of the cell?",
    options: ["Ribosome", "Nucleus", "Mitochondria", "Chloroplast"],
    answer: 2,
    difficulty: "easy"
  },
  {
    id: 3,
    q: "What is the chemical formula for water?",
    options: ["CO2", "H2O", "NaCl", "CH4"],
    answer: 1,
    difficulty: "easy"
  },
  {
    id: 4,
    q: "Which organelle is responsible for protein synthesis?",
    options: ["Ribosome", "Golgi apparatus", "Lysosome", "Vacuole"],
    answer: 0,
    difficulty: "medium"
  },
  {
    id: 5,
    q: "What type of chemical reaction absorbs heat from its surroundings?",
    options: ["Exothermic", "Endothermic", "Combustion", "Precipitation"],
    answer: 1,
    difficulty: "medium"
  },
  {
    id: 6,
    q: "Which pH value indicates a strongly acidic solution?",
    options: ["pH 13", "pH 7", "pH 2", "pH 9"],
    answer: 2,
    difficulty: "medium"
  },
  {
    id: 7,
    q: "What is the SI unit of electric resistance?",
    options: ["Volt", "Ampere", "Ohm", "Watt"],
    answer: 2,
    difficulty: "medium"
  },
  {
    id: 8,
    q: "Which enzyme in human saliva breaks down starch into simpler sugars?",
    options: ["Pepsin", "Salivary Amylase", "Lipase", "Trypsin"],
    answer: 1,
    difficulty: "hard"
  },
  {
    id: 9,
    q: "According to Ohm's Law, what happens to current if resistance doubles at constant voltage?",
    options: ["It doubles", "It quadruples", "It halves", "It stays constant"],
    answer: 2,
    difficulty: "hard"
  },
  {
    id: 10,
    q: "In the redox reaction CuO + H2 -> Cu + H2O, which substance acts as the reducing agent?",
    options: ["CuO", "H2", "Cu", "H2O"],
    answer: 1,
    difficulty: "hard"
  }
];

export default function App() {
  const [view, setView] = useState('join');
  const [user, setUser] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [isGenerating, setIsGenerating] = useState(false);

  // Live game telemetry shown in DevOverlay
  const [stats, setStats] = useState({
    topic: "General Science",
    masteryScore: 0.65,
    elo: 1200,
    difficulty: "Medium",
    streak: 0
  });

  // 1. Join Classroom
  const handleJoin = async (userData) => {
    try {
      const res = await api.joinClass(userData.code, userData.name);
      setUser({ ...userData, ...res });
    } catch {
      setUser({ ...userData, id: 'demo_student_1' });
    }
    setView('home');
  };

  // 2. Track 1: NCERT Preloaded
  const handleSelectNCERT = async (opts) => {
    const topicName = `${opts.subject} - ${opts.chapter}`;
    setStats((s) => ({ ...s, topic: topicName }));
    
    try {
      const quizzes = await api.getQuizzesByClass(opts.selectedClass);
      if (quizzes && quizzes.length > 0 && quizzes[0].questions) {
        setQuestions(quizzes[0].questions);
      } else {
        setQuestions(DEFAULT_QUESTIONS);
      }
    } catch {
      setQuestions(DEFAULT_QUESTIONS);
    }
    setQIndex(0);
    setView('quiz');
  };

  // 3. Track 2: PDF Upload
  const handleUploadPDF = async (file) => {
    setIsGenerating(true);
    const topicName = file.name.replace('.pdf', '');
    try {
      const quiz = await api.uploadPDF(file, { title: topicName });
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        setQuestions(quiz.questions);
      } else {
        setQuestions(DEFAULT_QUESTIONS);
      }
      setStats((s) => ({ ...s, topic: topicName }));
      setQIndex(0);
      setView('quiz');
    } catch {
      alert("AI Generation connecting or warming up. Launching demo quiz!");
      setQuestions(DEFAULT_QUESTIONS);
      setStats((s) => ({ ...s, topic: topicName }));
      setQIndex(0);
      setView('quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Answer Question -> Calls updateMastery + getStudentStats
  const handleAnswer = async (optionIdx, isCorrect) => {
    const studentId = user?.id || user?.student_id || 'demo_student_1';

    try {
      await api.updateMastery(studentId, stats.topic, isCorrect);
      const fresh = await api.getStudentStats(studentId);
      if (fresh) {
        setStats((prev) => ({
          ...prev,
          masteryScore: typeof fresh.mastery === 'number' ? fresh.mastery : prev.masteryScore,
          elo: fresh.elo ?? prev.elo,
          streak: isCorrect ? prev.streak + 1 : 0,
          difficulty: fresh.difficulty ?? (isCorrect ? "Hard" : "Medium")
        }));
      }
    } catch {
      // Local client fallback
      setStats((prev) => {
        const nextStreak = isCorrect ? prev.streak + 1 : 0;
        return {
          ...prev,
          streak: nextStreak,
          masteryScore: Math.max(0.1, Math.min(0.99, prev.masteryScore + (isCorrect ? 0.08 : -0.05))),
          difficulty: nextStreak >= 2 ? "Hard" : isCorrect ? "Medium" : "Easy",
          elo: prev.elo + (isCorrect ? 16 : -10)
        };
      });
    }

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
      {view === 'quiz' && questions.length > 0 && (
        <div className="max-w-xl mx-auto p-4 pt-12">
          <div className="flex justify-between items-center text-xs text-zinc-400 mb-3 font-mono">
            <span>Question {qIndex + 1} of {questions.length}</span>
            <span className="text-amber-400">Streak: {stats.streak} 🔥</span>
          </div>
          <AnswerCard
            question={questions[qIndex]}
            onAnswer={handleAnswer}
            userAvatar={user?.avatar || "🐉"}
          />
        </div>
      )}
      {view === 'leaderboard' && (
        <Leaderboard onBack={() => setView('home')} />
      )}

      {/* Developer Overlay HUD */}
      <DevOverlay stats={stats} />
    </div>
  );
}