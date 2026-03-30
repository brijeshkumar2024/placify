"""Quiz generation utilities with robust JSON validation and retries."""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Optional

from openai import OpenAI
from pydantic import ValidationError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from .models import QuizRequest, QuizResponse

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a quiz author for an educational app.
Only return valid JSON that matches this schema:
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
- Respond with JSON only. No explanations or prose.
- options must have exactly 4 short items.
- answer must exactly match one of the options.
- Respect the requested difficulty and number of questions.
"""


class QuizGenerationError(Exception):
    """Raised when quiz generation fails after retries."""


def _build_messages(request: QuizRequest):
    user_prompt = (
        f"Create a {request.num_questions}-question multiple-choice quiz about '{request.topic}'. "
        f"Difficulty: {request.difficulty}. "
        "Keep questions concise and domain-relevant. Do not include explanations."
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def _extract_json_block(text: str) -> str:
    """Try to pull out the JSON object from the LLM response."""
    # Prefer fenced code block
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, flags=re.S)
    if fenced:
        return fenced.group(1)

    # Fallback: find first { ... last }
    first = text.find("{")
    last = text.rfind("}")
    if first != -1 and last != -1 and last > first:
        return text[first : last + 1]

    raise ValueError("No JSON object found in LLM response")


def parse_quiz_json(text: str) -> QuizResponse:
    """Parse and validate quiz JSON, raising descriptive errors."""
    cleaned = _extract_json_block(text)
    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise QuizGenerationError(f"Invalid JSON from LLM: {exc.msg}") from exc

    try:
        return QuizResponse.model_validate(payload)
    except ValidationError as exc:
        raise QuizGenerationError(f"JSON did not match quiz schema: {exc}") from exc


def _get_client() -> Optional[OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not configured; using offline sample quiz.")
        return None
    return OpenAI(api_key=api_key)


def _call_llm(request: QuizRequest, client: OpenAI) -> str:
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    response = client.chat.completions.create(
        model=model,
        messages=_build_messages(request),
        temperature=0.3,
        max_tokens=800,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


def _offline_quiz(request: QuizRequest) -> QuizResponse:
    """Deterministic fallback for offline/local testing."""
    sample = {
        "questions": [
            {
                "question": f"{request.topic.title()} basics check #{i+1}",
                "options": [f"Option {ch}" for ch in ["A", "B", "C", "D"]],
                "answer": "Option A",
            }
            for i in range(request.num_questions)
        ]
    }
    return QuizResponse.model_validate(sample)


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=6),
    retry=retry_if_exception_type(QuizGenerationError),
)
def generate_quiz(request: QuizRequest) -> QuizResponse:
    """Generate a quiz using the LLM with robust parsing and retries."""
    client = _get_client()
    if not client:
        return _offline_quiz(request)

    raw = _call_llm(request, client)
    logger.debug("Raw LLM output: %s", raw)
    return parse_quiz_json(raw)


def quiz_to_json(response: QuizResponse) -> str:
    """Return a JSON string ready for frontend consumption."""
    return response.model_dump_json()
