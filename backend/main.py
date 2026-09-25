from fastapi import FastAPI
from pydantic import BaseModel

from database import engine, Base

import models  # noqa: F401  (registers models on Base before create_all)

app = FastAPI(title="Quiz Duel API")


@app.on_event("startup")
def on_startup():
    if engine is not None:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as exc:  # pragma: no cover - startup diagnostics only
            print(f"[startup] Could not connect/create tables: {exc}")
    else:
        print("[startup] DATABASE_URL not set - skipping table creation")


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- Request/response models ----------

class ClassroomCreateRequest(BaseModel):
    teacher_name: str | None = None


class ClassroomCreateResponse(BaseModel):
    classroom_id: int
    code: str


class ClassroomJoinRequest(BaseModel):
    code: str
    name: str


class ClassroomJoinResponse(BaseModel):
    student_id: int
    classroom_id: int
    avatar_choices: list[str]


class QuizSummary(BaseModel):
    id: int
    title: str
    question_count: int


class ClassroomQuizzesResponse(BaseModel):
    quizzes: list[QuizSummary]


class LeaderboardEntry(BaseModel):
    student_id: int
    name: str
    avatar: str
    level: int
    current_streak: int
    total_xp: int


class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardEntry]


# ---------- Routes (stubbed, no DB logic yet) ----------

@app.post("/api/classrooms/create", response_model=ClassroomCreateResponse)
def create_classroom(payload: ClassroomCreateRequest):
    return {"classroom_id": 1, "code": "ABC1"}


@app.post("/api/classrooms/join", response_model=ClassroomJoinResponse)
def join_classroom(payload: ClassroomJoinRequest):
    return {
        "student_id": 42,
        "classroom_id": 1,
        "avatar_choices": ["🐉", "🤖", "🧙", "🦁", "🚀", "⚡"],
    }


@app.get("/api/classrooms/{classroom_id}/quizzes", response_model=ClassroomQuizzesResponse)
def get_classroom_quizzes(classroom_id: int):
    return {
        "quizzes": [
            {"id": 1, "title": "Science Basics", "question_count": 15},
            {"id": 2, "title": "Math Sprint", "question_count": 10},
        ]
    }


@app.get("/api/leaderboard/{classroom_id}", response_model=LeaderboardResponse)
def get_leaderboard(classroom_id: int):
    return {
        "leaderboard": [
            {
                "student_id": 42,
                "name": "Arjun",
                "avatar": "🐉",
                "level": 3,
                "current_streak": 2,
                "total_xp": 120,
            },
            {
                "student_id": 43,
                "name": "Priya",
                "avatar": "🤖",
                "level": 2,
                "current_streak": 0,
                "total_xp": 80,
            },
        ]
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
