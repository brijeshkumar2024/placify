"""AI Placement Mentor — intent detection + contextual LLM responses."""
from __future__ import annotations

import os
import re
from typing import Optional

from openai import OpenAI

from .models import ChatRequest, ChatResponse, StudentContext

# ── Intent keywords ──────────────────────────────────────────────────────────
_INTENTS = {
    "greeting":   r"\b(hi|hey|hello|hii|helo|sup|yo)\b",
    "practice":   r"\b(practice|dsa|coding|algorithm|problem|leetcode|question)\b",
    "resume":     r"\b(resume|cv|portfolio|ats)\b",
    "interview":  r"\b(interview|mock|hr|system design|lld|hld|behavioral)\b",
    "jobs":       r"\b(job|jobs|apply|application|company|companies|opening)\b",
    "progress":   r"\b(progress|score|readiness|weak|strength|performance|analytics)\b",
    "motivation": r"\b(motivat|stress|anxious|nervous|help|stuck|lost|demotivat)\b",
}


def detect_intent(message: str) -> str:
    lower = message.lower()
    for intent, pattern in _INTENTS.items():
        if re.search(pattern, lower):
            return intent
    return "general"


# ── System prompt ─────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are Placify AI — a smart, empathetic Placement Mentor for engineering students.
Your job: give SHORT, PERSONALIZED, ACTIONABLE advice. Never give generic answers.
Always reference the student's actual data when available.
Respond in this exact JSON format (no markdown, no prose outside JSON):
{
  "message": "<1-3 sentence response>",
  "suggestions": ["<tip 1>", "<tip 2>"],
  "actions": ["<action_key>"],
  "intent": "<detected_intent>"
}
Valid action keys: start_mock_interview, open_dsa_practice, view_jobs, open_resume_review,
                   view_progress, open_learning_module, view_roadmap
Keep message under 60 words. Be direct, like a coach."""


def _context_block(ctx: Optional[StudentContext]) -> str:
    if not ctx:
        return ""
    parts = []
    if ctx.name:            parts.append(f"Name: {ctx.name}")
    if ctx.branch:          parts.append(f"Branch: {ctx.branch}")
    if ctx.cgpa:            parts.append(f"CGPA: {ctx.cgpa}")
    if ctx.skills:          parts.append(f"Skills: {', '.join(ctx.skills)}")
    if ctx.weak_areas:      parts.append(f"Weak areas: {', '.join(ctx.weak_areas)}")
    if ctx.mock_score is not None:
        parts.append(f"Last mock score: {ctx.mock_score}%")
    if ctx.applications_this_week is not None:
        parts.append(f"Applications this week: {ctx.applications_this_week}")
    if ctx.readiness_score is not None:
        parts.append(f"Placement readiness: {ctx.readiness_score}%")
    return "Student data:\n" + "\n".join(parts) if parts else ""


def _offline_response(intent: str, ctx: Optional[StudentContext]) -> ChatResponse:
    """Fallback when no API key is configured."""
    name = ctx.name.split()[0] if ctx and ctx.name else "there"
    weak = (ctx.weak_areas[0] if ctx and ctx.weak_areas else "DSA")
    score = ctx.mock_score if ctx and ctx.mock_score is not None else None

    responses = {
        "greeting": ChatResponse(
            message=f"Hey {name}! Ready to level up today? "
                    + (f"Your last mock score was {score}% — let's push that higher." if score else
                       f"Your weakest area is {weak}. Want to practice?"),
            suggestions=[f"Practice {weak} problems", "Review your last mock feedback"],
            actions=["start_mock_interview", "open_dsa_practice"],
            intent="greeting",
        ),
        "practice": ChatResponse(
            message=f"Let's practice {weak}! I'll start a focused mock session for you.",
            suggestions=["Solve 2 medium problems today", "Review time complexity"],
            actions=["open_dsa_practice", "start_mock_interview"],
            intent="practice",
        ),
        "resume": ChatResponse(
            message="Your resume is your first impression. Let's make it ATS-friendly and impactful.",
            suggestions=["Add quantified achievements", "Tailor skills to job descriptions"],
            actions=["open_resume_review"],
            intent="resume",
        ),
        "interview": ChatResponse(
            message=f"Time to prep! Focus on {weak} and behavioral questions today.",
            suggestions=["Practice STAR method for HR", "Revise system design basics"],
            actions=["start_mock_interview", "open_learning_module"],
            intent="interview",
        ),
        "jobs": ChatResponse(
            message="Let me show you jobs matching your profile right now.",
            suggestions=["Apply to at least 3 jobs this week", "Check eligibility criteria"],
            actions=["view_jobs"],
            intent="jobs",
        ),
        "progress": ChatResponse(
            message=f"Your readiness score needs attention in {weak}. Here's your improvement plan.",
            suggestions=[f"Dedicate 1 hour daily to {weak}", "Retake mock interview"],
            actions=["view_progress", "start_mock_interview"],
            intent="progress",
        ),
        "motivation": ChatResponse(
            message=f"You've got this, {name}! Every expert was once a beginner. Small steps daily = big results.",
            suggestions=["Set a 30-min daily practice goal", "Track your weekly progress"],
            actions=["view_roadmap", "view_progress"],
            intent="motivation",
        ),
    }
    return responses.get(intent, ChatResponse(
        message="I'm here to help! Ask me about practice, jobs, resume, or interview prep.",
        suggestions=["Start a mock interview", "Browse open jobs"],
        actions=["start_mock_interview", "view_jobs"],
        intent="general",
    ))


def _get_client() -> OpenAI:
    return OpenAI(
        base_url=os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"),
        api_key=os.getenv("NVIDIA_API_KEY", ""),
    )


def chat_with_mentor(request: ChatRequest) -> ChatResponse:
    import json

    intent = detect_intent(request.message)
    api_key = os.getenv("NVIDIA_API_KEY")

    if not api_key:
        return _offline_response(intent, request.context)

    # Build messages
    messages = [{"role": "system", "content": _SYSTEM_PROMPT}]

    ctx_block = _context_block(request.context)
    if ctx_block:
        messages.append({"role": "system", "content": ctx_block})

    for h in (request.history or [])[-6:]:
        messages.append({"role": "user" if h.role == "user" else "assistant", "content": h.content})

    messages.append({"role": "user", "content": f"[intent:{intent}] {request.message}"})

    client = _get_client()
    model = os.getenv("NVIDIA_MODEL", "openai/gpt-oss-120b")

    # Collect streamed chunks into a single string
    raw = ""
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=1,
        top_p=1,
        max_tokens=512,
        stream=True,
    )
    for chunk in stream:
        if not getattr(chunk, "choices", None):
            continue
        delta = chunk.choices[0].delta
        if getattr(delta, "content", None):
            raw += delta.content

    try:
        # Strip markdown fences if model wraps JSON in ```
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip())
        data = json.loads(cleaned)
        return ChatResponse(**data)
    except Exception:
        return _offline_response(intent, request.context)
