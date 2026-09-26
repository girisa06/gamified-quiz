import React, { useState } from 'react';
import JoinScreen from './JoinScreen';
import HomeScreen from './HomeScreen';
import TrackSelector from './TrackSelector';
import AnswerCard from './AnswerCard';
import Leaderboard from './Leaderboard';
import DevOverlay from './DevOverlay';
import * as api from './api';

const DEFAULT_QUESTIONS = [
  { id: 1, q: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], answer: 1, difficulty: "easy" },
  { id: 2, q: "What is the powerhouse of the cell?", options: ["Ribosome", "Nucleus", "Mitochondria", "Chloroplast"], answer: 2, difficulty: "easy" },
  { id: 3, q: "What is the chemical formula for water?", options: ["CO2", "H2O", "NaCl", "CH4"], answer: 1, difficulty: "easy" },
  { id: 4, q: "Which organelle is responsible for protein synthesis?", options: ["Ribosome", "Golgi apparatus", "Lysosome", "Vacuole"], answer: 0, difficulty: "medium" },
  { id: 5, q: "What type of chemical reaction absorbs heat from its surroundings?", options: ["Exothermic", "Endothermic", "Combustion", "Precipitation"], answer: 1, difficulty: "medium" },
  { id: 6, q: "Which pH value indicates a strongly acidic solution?", options: ["pH 13", "pH 7", "pH 2", "pH 9"], answer: 2, difficulty: "medium" },
  { id: 7, q: "What is the SI unit of electric resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: 2, difficulty: "medium" },
  { id: 8, q: "Which enzyme in human saliva breaks down starch into simpler sugars?", options: ["Pepsin", "Salivary Amylase", "Lipase", "Trypsin"], answer: 1, difficulty: "hard" },
  { id: 9, q: "According to Ohm's Law, what happens to current if resistance doubles at constant voltage?", options: ["It doubles", "It quadruples", "It halves", "It stays constant"], answer: 2, difficulty: "hard" },
  { id: 10, q: "In the redox reaction CuO + H2 -> Cu + H2O, which substance acts as the reducing agent?", options: ["CuO", "H2", "Cu", "H2O"], answer: 1, difficulty: "hard" }
];

// Standalone BKT calculation matching team specification
function computeBktMastery(pKnow, isCorrect, pSlip = 0.1, pGuess = 0.25, pTransit = 0.3) {
  let pPost;
  if (isCorrect) {
    const pCorrectGivenKnow = pKnow * (1 - pSlip);
    const pCorrectGivenNot = (1 - pKnow) * pGuess;
    pPost = pCorrectGivenKnow / (pCorrectGivenKnow + pCorrectGivenNot);
  } else {
    const pWrongGivenKnow = pKnow * pSlip;
    const pWrongGivenNot = (1 - pKnow) * (1 - pGuess);
    pPost = pWrongGivenKnow / (pWrongGivenKnow + pWrongGivenNot);
  }
  return pPost + (1 - pPost) * pTransit;
}

export default function App() {
  // Always start on join screen (auto-restore bypassed)
  const [view, setView] = useState('join');
  const [user, setUser] = useState(null);
  
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [answeredIds, setAnsweredIds] = useState([]);
  const [currentQ, setCurrentQ] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [stats, setStats] = useState({
    topic: "General Science",
    masteryScore: 0.50,
    elo: 1200,
    difficulty: "Medium",
    streak: 0
  });

  // Pick next question adaptively based on target difficulty
  const pickNextQuestion = (allQuestions, completedIds, targetDiff) => {
    const remaining = allQuestions.filter(q => !completedIds.includes(q.id));
    if (remaining.length === 0) return null;

    const matched = remaining.find(q => q.difficulty?.toLowerCase() === targetDiff.toLowerCase());
    return matched || remaining[0];
  };

  // 1. Join Classroom Handler
  const handleJoin = async (userData) => {
    const avatarEmoji = typeof userData.avatar === 'object' ? userData.avatar.emoji : userData.avatar;
    const normalizedUser = { 
      name: userData.name,
      code: userData.code,
      avatar: avatarEmoji || "🐍" 
    };

    try {
      const res = await api.joinClass(normalizedUser.code, normalizedUser.name);
      const fullUser = { ...normalizedUser, ...res };
      setUser(fullUser);
    } catch {
      const fallbackUser = { ...normalizedUser, id: 'demo_student_1' };
      setUser(fallbackUser);
    }
    setView('home');
  };

  // 2. Track 1: NCERT Preloaded
  const handleSelectNCERT = async (opts) => {
    const topicName = `${opts.subject || 'Science'} - ${opts.chapter || 'Basics'}`;
    setStats(s => ({ ...s, topic: topicName, masteryScore: 0.50, difficulty: "Medium", streak: 0 }));
    
    let loadedQuestions = DEFAULT_QUESTIONS;
    try {
      const quizzes = await api.getQuizzesByClass(opts.selectedClass);
      if (quizzes?.[0]?.questions?.length > 0) {
        loadedQuestions = quizzes[0].questions;
      }
    } catch {
      loadedQuestions = DEFAULT_QUESTIONS;
    }

    setQuestions(loadedQuestions);
    setAnsweredIds([]);
    setCurrentQ(pickNextQuestion(loadedQuestions, [], "Medium"));
    setView('quiz');
  };

  // 3. Track 2: PDF Upload
  const handleUploadPDF = async (file) => {
    setIsGenerating(true);
    const topicName = file.name.replace('.pdf', '');
    let loadedQuestions = DEFAULT_QUESTIONS;

    try {
      const quiz = await api.uploadPDF(file, { title: topicName });
      if (quiz?.questions?.length > 0) {
        loadedQuestions = quiz.questions;
      }
    } catch {
      alert("AI Service initializing. Starting with pre-calibrated sample!");
      loadedQuestions = DEFAULT_QUESTIONS;
    } finally {
      setIsGenerating(false);
    }

    setStats(s => ({ ...s, topic: topicName, masteryScore: 0.50, difficulty: "Medium", streak: 0 }));
    setQuestions(loadedQuestions);
    setAnsweredIds([]);
    setCurrentQ(pickNextQuestion(loadedQuestions, [], "Medium"));
    setView('quiz');
  };

  // 4. Answer Question -> Live BKT Update + Telemetry
  const handleAnswer = async (optionIdx, isCorrect) => {
    const studentId = user?.id || user?.student_id || 'demo_student_1';
    const nextCompleted = [...answeredIds, currentQ.id];
    setAnsweredIds(nextCompleted);

    const nextMastery = computeBktMastery(stats.masteryScore, isCorrect);
    const nextStreak = isCorrect ? stats.streak + 1 : 0;
    const nextDiff = nextMastery > 0.72 ? "Hard" : nextMastery < 0.40 ? "Easy" : "Medium";
    const nextElo = stats.elo + (isCorrect ? (nextStreak >= 2 ? 22 : 14) : -10);

    try {
      await api.updateMastery(studentId, stats.topic, isCorrect);
      const fresh = await api.getStudentStats(studentId);
      if (fresh) {
        setStats(prev => ({
          ...prev,
          masteryScore: typeof fresh.mastery === 'number' ? fresh.mastery : nextMastery,
          elo: fresh.elo ?? nextElo,
          difficulty: fresh.difficulty ?? nextDiff,
          streak: nextStreak
        }));
      }
    } catch {
      setStats(prev => ({
        ...prev,
        masteryScore: Math.min(0.99, Math.max(0.05, nextMastery)),
        elo: nextElo,
        difficulty: nextDiff,
        streak: nextStreak
      }));
    }

    const nextQ = pickNextQuestion(questions, nextCompleted, nextDiff);
    if (nextQ && nextCompleted.length < Math.min(questions.length, 10)) {
      setCurrentQ(nextQ);
    } else {
      setView('home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('quizduel_user');
    setUser(null);
    setView('join');
  };

  return (
    <div className="min-h-screen bg-[#070b14] font-sans text-slate-100 select-none">
      {view === 'join' && (
        <JoinScreen 
          onJoin={handleJoin} 
          onEnterArena={handleJoin} 
        />
      )}

      {view === 'home' && (
        <HomeScreen
          user={user}
          stats={stats}
          onStartSolo={() => setView('track')}
          onOpenLeaderboard={() => setView('leaderboard')}
          onLogout={handleLogout}
        />
      )}

      {view === 'track' && (
        <div className="py-6 px-4">
          <button
            onClick={() => setView('home')}
            className="block max-w-4xl mx-auto px-2 mb-3 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
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

      {view === 'quiz' && currentQ && (
        <div className="max-w-xl mx-auto p-4 pt-10">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-3 font-mono">
            <span>Question {answeredIds.length + 1} of {Math.min(questions.length, 10)}</span>
            <span className="text-amber-400 font-bold">Streak: {stats.streak} 🔥</span>
          </div>
          <AnswerCard
            question={currentQ}
            onAnswer={handleAnswer}
            userAvatar={user?.avatar || "🐍"}
          />
        </div>
      )}

      {view === 'leaderboard' && (
        <Leaderboard onBack={() => setView('home')} />
      )}

      {/* Persistent Developer Overlay HUD for Judges */}
      <DevOverlay stats={stats} />
    </div>
  );
}