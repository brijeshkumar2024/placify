"""
Streamlit UI for EduAI quiz generation.
Includes modern styling, loading states, and friendly error handling.
"""
from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

BASE_DIR = Path(__file__).resolve().parent
PARENT_DIR = BASE_DIR.parent
if str(PARENT_DIR) not in sys.path:
    sys.path.append(str(PARENT_DIR))

from eduai.models import QuizRequest
from eduai.quiz_generator import QuizGenerationError, generate_quiz

st.set_page_config(
    page_title="EduAI Quiz",
    layout="wide",
    page_icon="🎯",
    initial_sidebar_state="expanded",
)

# Global styles: dark glassmorphism
st.markdown(
    """
    <style>
    body {background: radial-gradient(120% 150% at 10% 20%, #0f172a 0%, #0b1021 35%, #0a0f1f 100%);}
    .main {padding: 1.5rem 2rem;}
    .css-ffhzg2 {font-family: 'Inter', system-ui, -apple-system, sans-serif;}
    .glass-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 18px 20px;
        box-shadow: 0 20px 70px rgba(0,0,0,0.4);
        backdrop-filter: blur(16px);
        margin-bottom: 16px;
    }
    .question-title {font-size: 1.05rem; font-weight: 700; color: #e2e8f0;}
    .option-label {padding: 8px 12px; border-radius: 12px; border: 1px solid #1f2937;}
    .correct {background: linear-gradient(120deg, #22c55e33, #16a34a33); border-color: #22c55e;}
    .wrong {background: linear-gradient(120deg, #ef444433, #dc262633); border-color: #ef4444;}
    .pill {display:inline-flex; gap:8px; align-items:center; padding:4px 10px; border-radius:999px; background:#0f172a; border:1px solid #1f2937; color:#cbd5f5; font-size:0.78rem;}
    .section-title {color:#e5e7eb; letter-spacing:0.02em; margin-bottom:0.25rem;}
    .subtle {color:#9ca3af; font-size:0.9rem;}
    </style>
    """,
    unsafe_allow_html=True,
)


def render_header():
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("### 🎯 EduAI Quiz Builder")
        st.markdown(
            '<div class="subtle">Generate short, focused MCQs with one click.</div>',
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            '<div class="pill">Fast Mode</div><div class="pill" style="margin-top:6px;">JSON Safe</div>',
            unsafe_allow_html=True,
        )


def render_form():
    with st.form("quiz_form"):
        col1, col2, col3 = st.columns([2, 1, 1])
        with col1:
            topic = st.text_input("Topic", value="Data Structures", help="What should the quiz cover?")
        with col2:
            difficulty = st.select_slider("Difficulty", options=["easy", "hard"], value="easy")
        with col3:
            num_questions = st.slider("Number of questions", 3, 10, 5, help="Keeps quizzes short and scannable.")

        c1, c2 = st.columns([1, 1])
        with c1:
            generate = st.form_submit_button("Generate Quiz 🚀", use_container_width=True)
        with c2:
            regen = st.form_submit_button("Regenerate ♻️", use_container_width=True)
    return (generate or regen), QuizRequest(topic=topic, difficulty=difficulty, num_questions=num_questions)


def render_quiz(quiz):
    for idx, q in enumerate(quiz.questions):
        with st.container():
            st.markdown(
                f'<div class="glass-card"><div class="question-title">Q{idx+1}. {q.question}</div></div>',
                unsafe_allow_html=True,
            )
            choice = st.radio(
                "Choose an option",
                q.options,
                key=f"q_{idx}",
                label_visibility="collapsed",
            )
            # Feedback row
            if choice:
                if choice == q.answer:
                    st.markdown(
                        f'<div class="glass-card correct">✅ Correct: {q.answer}</div>',
                        unsafe_allow_html=True,
                    )
                else:
                    st.markdown(
                        f'<div class="glass-card wrong">❌ {choice} is incorrect. Answer: {q.answer}</div>',
                        unsafe_allow_html=True,
                    )


def main():
    render_header()
    should_generate, request = render_form()

    if should_generate:
        with st.spinner("Generating quiz..."):
            try:
                quiz = generate_quiz(request)
                st.session_state["quiz"] = quiz
                st.toast("Quiz ready", icon="✅")
            except QuizGenerationError as exc:
                st.error(f"Could not generate quiz: {exc}")
            except Exception as exc:  # pragma: no cover - defensive
                st.error("Something went wrong. Please try again.")
                st.exception(exc)

    quiz = st.session_state.get("quiz")
    if quiz:
        st.markdown("#### Your Quiz")
        render_quiz(quiz)
    else:
        st.info("Fill the form above to generate a quiz.")


if __name__ == "__main__":
    main()
