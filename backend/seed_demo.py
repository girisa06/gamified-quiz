"""Seed the database with the 4 demo quizzes via the live API.

Usage:
    1. Start the server: uvicorn main:app --reload
    2. In another terminal: python seed_demo.py
"""
import json
import os
from pathlib import Path

import requests

BASE_URL = os.getenv("SEED_API_BASE_URL", "http://localhost:8000")
QUIZ_DIR = Path(__file__).parent / "quizzes"
QUIZ_FILES = ["quiz1.json", "quiz_rookie.json", "quiz_champion.json", "quiz_legend.json"]


def get_or_create_demo_classroom() -> int:
    response = requests.post(f"{BASE_URL}/api/classrooms/create", json={"teacher_name": "Demo Seeder"})
    response.raise_for_status()
    data = response.json()
    print(f"Using demo classroom_id={data['classroom_id']} (code={data['code']})")
    return data["classroom_id"]


def seed_quiz(classroom_id: int, file_name: str) -> int:
    path = QUIZ_DIR / file_name
    with open(path, "r", encoding="utf-8") as f:
        quiz_data = json.load(f)

    payload = {
        "classroom_id": classroom_id,
        "title": quiz_data["title"],
        "subject": quiz_data.get("subject"),
        "questions": quiz_data["questions"],
    }

    response = requests.post(f"{BASE_URL}/api/quizzes/create", json=payload)
    response.raise_for_status()
    return response.json()["quiz_id"]


def main():
    classroom_id = get_or_create_demo_classroom()
    quiz_ids = [seed_quiz(classroom_id, file_name) for file_name in QUIZ_FILES]
    print(f"Seeded 4 quizzes: {quiz_ids}")


if __name__ == "__main__":
    main()
