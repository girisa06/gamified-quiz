const BASE_URL = "http://127.0.0.1:8000";

// 1. Join Classroom (supports both joinClass and joinClassroom)
export const joinClass = async (code, name) => {
  try {
    const res = await fetch(`${BASE_URL}/classrooms/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name }),
    });
    if (!res.ok) throw new Error("Join failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline join fallback:", err);
    return { student_id: "demo_student_1", name, code };
  }
};
export const joinClassroom = joinClass;

// 2. Student Stats (supports both getStudentStats and fetchStudentStats)
export const getStudentStats = async (studentId = 1) => {
  try {
    const res = await fetch(`${BASE_URL}/students/${studentId}/stats`);
    if (!res.ok) throw new Error("Stats failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline stats fallback:", err);
    return null;
  }
};
export const fetchStudentStats = getStudentStats;

// 3. BKT Mastery Update (supports both updateMastery and submitAnswer)
export const updateMastery = async (studentId, topic = "photosynthesis", isCorrect = true) => {
  try {
    const res = await fetch(`${BASE_URL}/mastery/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        topic: topic || "photosynthesis",
        correct: isCorrect,
      }),
    });
    if (!res.ok) throw new Error("Mastery update failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline mastery fallback:", err);
    return null;
  }
};
export const submitAnswer = async ({ questionId, trackId, isCorrect, studentId = 1 }) => {
  return updateMastery(studentId, trackId, isCorrect);
};

// 4. Track 1: Get Quizzes by Class Level
export const getQuizzesByClass = async (classLevel = "10") => {
  try {
    const res = await fetch(`${BASE_URL}/classrooms/1/quizzes?class_level=${classLevel}`);
    if (!res.ok) throw new Error("Fetch quizzes failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline quiz fallback:", err);
    return null;
  }
};

// 5. Track 2: PDF Upload to LLM Pipeline
export const uploadPDF = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata.title) formData.append("title", metadata.title);

  try {
    const res = await fetch(`${BASE_URL}/quizzes/generate-from-pdf`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("PDF generation failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline PDF fallback:", err);
    throw err; // Caught by TrackSelector / App.jsx fallback
  }
};

// 6. Multiplayer: Challenges
export const createChallenge = async (quizId, studentAId, studentBId) => {
  try {
    const res = await fetch(`${BASE_URL}/challenges/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: quizId,
        student_a_id: studentAId,
        student_b_id: studentBId,
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Using offline challenge create fallback:", err);
    return { id: "chal_" + Date.now(), status: "waiting" };
  }
};

export const getChallenges = async (studentId = 1) => {
  try {
    const res = await fetch(`${BASE_URL}/challenges/${studentId}`);
    if (!res.ok) throw new Error("Challenges failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline challenges fallback:", err);
    return [];
  }
};

export const submitChallengeScore = async (challengeId, studentId, score) => {
  try {
    const res = await fetch(`${BASE_URL}/challenges/${challengeId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, score }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Using offline score submit fallback:", err);
    return { winner: studentId, score };
  }
};

// 7. Leaderboard
export const getLeaderboard = async (classroomId = 1) => {
  try {
    const res = await fetch(`${BASE_URL}/leaderboard/${classroomId}`);
    return await res.json();
  } catch (err) {
    console.warn("Using offline leaderboard fallback:", err);
    return [];
  }
};

// 8. AI Tutor Hint
export const getTutorHint = async (topic, isCorrect) => {
  try {
    const res = await fetch(`${BASE_URL}/tutor/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, is_correct: isCorrect }),
    });
    return await res.json();
  } catch (err) {
    console.warn("Using offline tutor fallback:", err);
    return { hint: "Review the fundamental concepts for this topic." };
  }
};