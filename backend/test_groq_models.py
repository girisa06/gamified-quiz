"""Find a Groq model that works on your key. Usage: python test_groq_models.py"""
import os
import sys

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Your preferred order first, then known-good fallbacks. Only models Groq currently lists are tried.
CANDIDATES = [
    "llama-3.2-90b-vision-preview",
    "gemma2-9b-it",
    "llama-3.2-11b-vision-preview",
    "gemma-7b-it",
    "mixtral-8x7b-32768",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
]
TEST_PROMPT = "Extract 3 quiz questions from: The sun is a star. Plants use photosynthesis. Return JSON only."

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    sys.exit("GROQ_API_KEY not loaded from .env")
client = Groq(api_key=api_key)

try:
    available = {m.id for m in client.models.list().data}
    print(f"Groq lists {len(available)} models for this key.")
except Exception as e:
    available = None
    print(f"Could not list models ({str(e)[:80]}); trying candidates blindly.")

for model in CANDIDATES:
    if available is not None and model not in available:
        print(f"⏭  {model}: not in Groq's current model list")
        continue
    try:
        print(f"\n🧪 Testing {model}...")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": TEST_PROMPT}],
            max_tokens=500,
        )
        print(f"✅ {model} WORKS")
        print(f"Response preview: {response.choices[0].message.content[:100]}...")
        break
    except Exception as e:
        print(f"❌ {model} failed: {str(e)[:120]}")
else:
    print("\nNo candidate worked.")
    if available:
        print("Models available to your key:", ", ".join(sorted(available)))
