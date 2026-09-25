const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

async function request(path, { method = "GET", body, headers = {}, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`API ${method} ${path} failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

const jsonPost = (path, body) => request(path, { method: "POST", body });

function rememberedClassroomId() {
  if (typeof localStorage === "undefined") return undefined;
  try {
    return JSON.parse(localStorage.getItem("quizDuel.student") ?? "null")?.classroomId;
  } catch {
    return undefined;
  }
}

export const createClassroom = (classroom) => jsonPost("/api/classrooms/create", classroom);
export const joinClass = (code, name) => jsonPost("/api/classrooms/join", { code, name });
export const getQuizzes = (classroomId = rememberedClassroomId()) => getQuizzesByClass(classroomId);
export const getQuizzesByClass = (classroomId) =>
  request(`/api/classrooms/${encodeURIComponent(classroomId)}/quizzes`);
export const getQuiz = (id) => request(`/api/quizzes/${encodeURIComponent(id)}`);
export const createQuiz = (quiz) => jsonPost("/api/quizzes/create", quiz);

export const uploadPDF = (file, metadata = {}) => {
  if (!(file instanceof Blob)) throw new TypeError("uploadPDF expects a File or Blob.");
  const form = new FormData();
  form.append("file", file, file.name || "quiz-source.pdf");
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  return request("/api/quizzes/generate-from-pdf", { method: "POST", body: form }).then(
    (result) => result.quiz ?? result.generated_quiz ?? result,
  );
};

export const createChallenge = (friendId, quizId, studentId) =>
  jsonPost("/api/challenges/create", {
    challenger_id: studentId,
    challenged_id: friendId,
    quiz_id: quizId,
  });

export const getChallenges = (studentId) =>
  request(`/api/challenges/${encodeURIComponent(studentId)}`);

export const submitChallengeScore = (challengeId, score, studentId) =>
  jsonPost(`/api/challenges/${encodeURIComponent(challengeId)}/submit`, {
    student_id: studentId,
    score,
  });

export const getLeaderboard = (classroomId) =>
  request(`/api/leaderboard/${encodeURIComponent(classroomId)}`);

export const updateMastery = (studentId, topic, correct) =>
  jsonPost("/api/mastery/update", { student_id: studentId, topic, correct: Boolean(correct) });

export const getStudentStats = (studentId) =>
  request(`/api/students/${encodeURIComponent(studentId)}/stats`);

export const getMastery = async (studentId) => {
  const stats = await getStudentStats(studentId);
  return stats.mastery ?? stats.topics ?? [];
};