# EduAI Quiz Service

FastAPI + Streamlit micro-app for generating clean JSON quizzes with LLMs.

## Setup

```bash
cd ai-service/eduai
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Set your API key (optional – offline sample works without it):

```bash
$env:OPENAI_API_KEY="sk-..."
```

## Run the backend

```bash
uvicorn eduai.app:app --app-dir ai-service --host 0.0.0.0 --port 8000 --reload
```

## Run the Streamlit UI

```bash
streamlit run ai-service/eduai/streamlit_app.py
```

## Notes

- LLM output is validated with `json.loads()` and Pydantic before returning to clients.
- Automatic retries (3x with exponential backoff) for malformed LLM output.
- Response schema is enforced to:

```
{
  "questions": [
    {"question": "string", "options": ["A","B","C","D"], "answer": "string"}
  ]
}
```
