# EduAI Quiz Generator

Production-ready Streamlit UI plus strict JSON validation for LLM-generated quizzes.

## Quick start
```bash
cd ai-service/quiz-generator
python -m venv .venv
.venv/Scripts/activate  # on Windows
pip install -r requirements.txt
set OPENAI_API_KEY=your_key_here
streamlit run app.py
```

Environment overrides:
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

## Notes
- All LLM responses are forced into `response_format=json_object` and validated via Pydantic.
- Any invalid JSON triggers safe parsing and automatic retries (up to 3).
- UI uses a glassmorphic dark theme, adds loading spinners, and supports one-click regeneration.
