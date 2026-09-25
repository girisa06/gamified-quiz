from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    JSON,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.orm import relationship

from database import Base


class Classroom(Base):
    __tablename__ = "classroom"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(4), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    students = relationship("StudentProfile", back_populates="classroom")
    quizzes = relationship("Quiz", back_populates="classroom")


class StudentProfile(Base):
    __tablename__ = "student_profile"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classroom.id"), nullable=False)
    name = Column(String(100), nullable=False)
    avatar = Column(String(10), nullable=True)
    level = Column(Integer, default=1, nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    wins = Column(Integer, default=0, nullable=False)

    classroom = relationship("Classroom", back_populates="students")


class Quiz(Base):
    __tablename__ = "quiz"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classroom.id"), nullable=False)
    title = Column(String(200), nullable=False)
    subject = Column(String(100), nullable=True)
    created_by_student_id = Column(Integer, ForeignKey("student_profile.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    classroom = relationship("Classroom", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz")


class Question(Base):
    __tablename__ = "question"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quiz.id"), nullable=False)
    q_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    answer_index = Column(Integer, nullable=False)
    difficulty = Column(String(20), nullable=False)
    explanation = Column(Text, nullable=True)

    quiz = relationship("Quiz", back_populates="questions")


class Challenge(Base):
    __tablename__ = "challenge"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quiz.id"), nullable=False)
    student_a_id = Column(Integer, ForeignKey("student_profile.id"), nullable=False)
    student_b_id = Column(Integer, ForeignKey("student_profile.id"), nullable=False)
    status = Column(String(30), default="waiting_for_player_b", nullable=False)
    winner_id = Column(Integer, ForeignKey("student_profile.id"), nullable=True)
    score_a = Column(Integer, nullable=True)
    score_b = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BotDifficulty(Base):
    __tablename__ = "bot_difficulty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), unique=True, nullable=False)
    easy_q_count = Column(Integer, default=0, nullable=False)
    medium_q_count = Column(Integer, default=0, nullable=False)
    hard_q_count = Column(Integer, default=0, nullable=False)
