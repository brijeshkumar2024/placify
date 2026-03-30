from typing import List

from pydantic import BaseModel, Field, ValidationError


class QuizQuestion(BaseModel):
    question: str = Field(..., min_length=3)
    options: List[str] = Field(..., min_length=4, max_length=4)
    answer: str = Field(..., min_length=1)

    def is_valid_answer(self) -> bool:
        return self.answer in self.options


class QuizPayload(BaseModel):
    questions: List[QuizQuestion] = Field(..., min_length=1)

    @classmethod
    def validate_payload(cls, data: dict) -> "QuizPayload":
        """
        Ensure the payload matches the expected schema and that answers are present in options.
        """
        payload = cls.model_validate(data)
        for item in payload.questions:
            if not item.is_valid_answer():
                raise ValidationError(
                    [
                        {
                            "loc": ("questions", "answer"),
                            "msg": "answer must match one of the options",
                            "type": "value_error.mismatch",
                        }
                    ],
                    cls,
                )
        return payload
