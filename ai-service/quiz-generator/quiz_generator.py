import json
import os
import re
from typing import Optional

from openai import OpenAI
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter

from schema import QuizPayload


class QuizGenerationError(Exception):
    """Raised when the LLM cannot return a valid quiz payload."""


def _extract_json_block(text: str) -> Optional[str]:
    """
    Try to pull the first JSON object from a text blob.
    """
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    return match.group(0) if match else None


def _safe_json_loads(content: str) -> dict:
    """
    Safely parse JSON with descriptive errors.
    """
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise QuizGenerationError(f"LLM returned invalid JSON: {exc}") from exc


def _build_messages(topic: str, num_questions: int, difficulty: str) -> list[dict]:
    schema_hint = """
Return ONLY a JSON object matching exactly this schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "string"
    }
  ]
}

Rules:
- No explanations, prose, markdown, or code fences.
- Exactly {n} questions.
- Difficulty: {difficulty}.
- Keep questions concise and single-sentence.
""".strip()

    return [
        {"role": "system", "content": "You generate multiple-choice quizzes. Respond with JSON only."},
        {
            "role": "user",
            "content": f"Topic: {topic}\n{schema_hint.format(n=num_questions, difficulty=difficulty)}",
        },
    ]


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential_jitter(initial=1, max=6),
    retry=retry_if_exception_type(QuizGenerationError),
)
def generate_quiz(
    topic: str,
    num_questions: int,
    difficulty: str = "easy",
    model: Optional[str] = None,
) -> QuizPayload:
    """
    Generate a quiz using an LLM, returning a validated QuizPayload.
    """
    if num_questions < 1:
        raise ValueError("num_questions must be at least 1")

    model_name = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    messages = _build_messages(topic, num_questions, difficulty)
    response = client.chat.completions.create(
        model=model_name,
        messages=messages,
        temperature=0.4,
        max_tokens=512,
        response_format={"type": "json_object"},
    )

    raw_content = response.choices[0].message.content or ""

    # Strip any accidental code fences or whitespace
    candidate = raw_content.strip()
    if not candidate.startswith("{"):
        extracted = _extract_json_block(candidate)
        candidate = extracted or candidate

    data = _safe_json_loads(candidate)
    try:
        return QuizPayload.validate_payload(data)
    except Exception as exc:
        raise QuizGenerationError(f"LLM returned JSON that failed schema validation: {exc}") from exc
