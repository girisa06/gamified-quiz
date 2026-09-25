import random
import string
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models  # noqa: F401  (registers models on Base before create_all)
from models import Classroom, Question, Quiz, StudentProfile

app = FastAPI(title="Quiz Duel API")

VALID_DIFFICULTIES = {"easy", "medium", "hard"}
AVATAR_CHOICES = ["🐉", "🤖", "🧙", "🦁", "🚀", "⚡"]


@app.on_event("startup")
def on_startup():
    if engine is not None:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as exc:  # pragma: no cover - startup diagnostics only
            print(f"[startup] Could not connect/create tables: {exc}")
    else:
        print("[startup] DATABASE_URL not set - skipping table creation")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request, exc):
    return JSONResponse(status_code=400, content={"detail": exc.errors()})


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- Request/response models ----------

class ClassroomCreateRequest(BaseModel):
    teacher_name: Optional[str] = None


class ClassroomCreateResponse(BaseModel):
    classroom_id: int
    code: str


class ClassroomJoinRequest(BaseModel):
    code: str
    name: str


class ClassroomJoinResponse(BaseModel):
    student_id: int
    classroom_id: int
    avatar_choices: List[str]


class QuizSummary(BaseModel):
    id: int
    title: str
    subject: Optional[str] = None
    question_count: int


class ClassroomQuizzesResponse(BaseModel):
    quizzes: List[QuizSummary]


class QuestionOut(BaseModel):
    id: int
    q: str
    options: List[str]
    difficulty: str
    explanation: Optional[str] = None


class QuizOut(BaseModel):
    id: int
    title: str
    subject: Optional[str] = None
    classroom_id: int


class QuizDetailResponse(BaseModel):
    quiz: QuizOut
    questions: List[QuestionOut]


class LeaderboardEntry(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None
    level: int
    current_streak: int
    xp: int


class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]


class QuestionIn(BaseModel):
    q: str
    options: List[str]
    answer: int
    difficulty: str
    explanation: Optional[str] = None


class QuizCreateRequest(BaseModel):
    classroom_id: int
    title: str
    subject: Optional[str] = None
    created_by_student_id: Optional[int] = None
    questions: List[QuestionIn]


class QuizCreateResponse(BaseModel):
    quiz_id: int


# ---------- Helpers ----------

def generate_classroom_code(db: Session) -> str:
    charset = string.ascii_uppercase + string.digits
    for _ in range(20):
        code = "".join(random.choices(charset, k=4))
        if not db.query(Classroom).filter(Classroom.code == code).first():
            return code
    raise HTTPException(status_code=500, detail="Could not generate a unique classroom code")


def validate_quiz_payload(payload: QuizCreateRequest) -> None:
    if len(payload.questions) < 5:
        raise HTTPException(status_code=400, detail="Quiz must have at least 5 questions")
    for i, q in enumerate(payload.questions):
        if not q.q or not q.options:
            raise HTTPException(status_code=400, detail=f"Question {i} is missing q or options")
        if q.difficulty not in VALID_DIFFICULTIES:
            raise HTTPException(
                status_code=400,
                detail=f"Question {i} has invalid difficulty '{q.difficulty}' (must be easy/medium/hard)",
            )
        if not (0 <= q.answer <= 3) or q.answer >= len(q.options):
            raise HTTPException(
                status_code=400, detail=f"Question {i} has an invalid answer index: {q.answer}"
            )


# ---------- Routes ----------

@app.post("/api/classrooms/create", response_model=ClassroomCreateResponse)
def create_classroom(payload: ClassroomCreateRequest, db: Session = Depends(get_db)):
    try:
        code = generate_classroom_code(db)
        classroom = Classroom(code=code)
        db.add(classroom)
        db.commit()
        db.refresh(classroom)
        return {"classroom_id": classroom.id, "code": classroom.code}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/classrooms/join", response_model=ClassroomJoinResponse)
def join_classroom(payload: ClassroomJoinRequest, db: Session = Depends(get_db)):
    try:
        classroom = db.query(Classroom).filter(Classroom.code == payload.code).first()
        if not classroom:
            raise HTTPException(status_code=404, detail="Classroom not found")

        student = StudentProfile(
            classroom_id=classroom.id,
            name=payload.name,
            avatar=None,
            level=1,
            xp=0,
            current_streak=0,
            wins=0,
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        return {
            "student_id": student.id,
            "classroom_id": classroom.id,
            "avatar_choices": AVATAR_CHOICES,
        }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/classrooms/{classroom_id}/quizzes", response_model=ClassroomQuizzesResponse)
def get_classroom_quizzes(classroom_id: int, db: Session = Depends(get_db)):
    try:
        quizzes = db.query(Quiz).filter(Quiz.classroom_id == classroom_id).all()
        return {
            "quizzes": [
                {
                    "id": quiz.id,
                    "title": quiz.title,
                    "subject": quiz.subject,
                    "question_count": len(quiz.questions),
                }
                for quiz in quizzes
            ]
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/quizzes/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        return {
            "quiz": {
                "id": quiz.id,
                "title": quiz.title,
                "subject": quiz.subject,
                "classroom_id": quiz.classroom_id,
            },
            "questions": [
                {
                    "id": question.id,
                    "q": question.q_text,
                    "options": question.options,
                    "difficulty": question.difficulty,
                    "explanation": question.explanation,
                }
                for question in quiz.questions
            ],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/leaderboard/{classroom_id}", response_model=LeaderboardResponse)
def get_leaderboard(classroom_id: int, db: Session = Depends(get_db)):
    try:
        students = (
            db.query(StudentProfile)
            .filter(StudentProfile.classroom_id == classroom_id)
            .order_by(StudentProfile.level.desc(), StudentProfile.xp.desc())
            .limit(10)
            .all()
        )
        return {
            "leaderboard": [
                {
                    "id": student.id,
                    "name": student.name,
                    "avatar": student.avatar,
                    "level": student.level,
                    "current_streak": student.current_streak,
                    "xp": student.xp,
                }
                for student in students
            ]
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/quizzes/create", response_model=QuizCreateResponse)
def create_quiz(payload: QuizCreateRequest, db: Session = Depends(get_db)):
    validate_quiz_payload(payload)
    try:
        classroom = db.query(Classroom).filter(Classroom.id == payload.classroom_id).first()
        if not classroom:
            raise HTTPException(status_code=404, detail="Classroom not found")

        quiz = Quiz(
            classroom_id=payload.classroom_id,
            title=payload.title,
            subject=payload.subject,
            created_by_student_id=payload.created_by_student_id,
        )
        db.add(quiz)
        db.flush()  # assign quiz.id without committing yet

        for q in payload.questions:
            db.add(
                Question(
                    quiz_id=quiz.id,
                    q_text=q.q,
                    options=q.options,
                    answer_index=q.answer,
                    difficulty=q.difficulty,
                    explanation=q.explanation,
                )
            )

        db.commit()
        db.refresh(quiz)
        return {"quiz_id": quiz.id}
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
