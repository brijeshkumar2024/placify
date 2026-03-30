"""Pydantic models for quiz generation with strict validation."""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator
from typing import List


class QuizQuestion(BaseModel):
    question: str = Field(..., min_length=3, description="Plain question text")
    options: List[str] = Field(..., min_items=4, max_items=4, description="Exactly four options")
    answer: str = Field(..., description="Correct option text")

    @field_validator("options")
    @classmethod
    def ensure_four_options(cls, value: List[str]) -> List[str]:
        if len(value) != 4:
            raise ValueError("options must contain exactly 4 items")
        return value

    @field_validator("answer")
    @classmethod
    def answer_must_be_in_options(cls, value: str, info) -> str:
        # Ensure the answer is one of the provided options to avoid schema drift
        options = info.data.get("options") or []
        if options and value not in options:
            raise ValueError("answer must match one of the options")
        return value

    class Config:
        extra = "forbid"


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

    class Config:
        extra = "forbid"


class QuizRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    difficulty: str = Field("easy", pattern="^(easy|hard)$")
    num_questions: int = Field(5, ge=1, le=20)

    class Config:
        extra = "forbid"
