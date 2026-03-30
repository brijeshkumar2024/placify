import os
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

from quiz_generator import QuizGenerationError, generate_quiz

load_dotenv()

st.set_page_config(
    page_title="EduAI Quiz",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed",
)


def inject_styles() -> None:
    css = """
    <style>
    body { background: radial-gradient(circle at 10% 20%, #1f2937 0%, #0f172a 35%, #0b1220 100%); color: #e5e7eb; }
    .glass {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.06);
        box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        border-radius: 16px;
        padding: 18px 20px;
        backdrop-filter: blur(12px);
    }
    .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #1e293b; color: #cbd5e1; font-size: 12px; }
    .answer { color: #22d3ee; font-weight: 600; }
    .stButton>button {
        border-radius: 10px;
        padding: 10px 18px;
        border: 1px solid #22d3ee;
        background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 70%);
        color: #f8fafc;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(14,165,233,0.28);
    }
    .stRadio > div { gap: 8px; }
    .question-card { margin-bottom: 14px; }
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)


def render_quiz():
    quiz = st.session_state.get("quiz_payload")
    if not quiz:
        return

    for idx, q in enumerate(quiz.questions, start=1):
        with st.container():
            st.markdown(f"<div class='glass question-card'><strong>Q{idx}.</strong> {q.question}</div>", unsafe_allow_html=True)
            choice = st.radio(
                "Choose an option",
                q.options,
                key=f"q-{idx}",
                label_visibility="collapsed",
            )
            if choice:
                is_correct = choice == q.answer
                st.markdown(
                    f"<div class='pill'>{'Correct' if is_correct else 'Answer'}</div> "
                    f"<span class='answer'>{q.answer}</span>",
                    unsafe_allow_html=True,
                )
        st.divider()


def main():
    inject_styles()

    st.title("EduAI Quiz Builder")
    st.caption("Fast, structured quizzes with strict JSON validation.")

    left, right = st.columns([1.8, 1])
    with left:
        topic = st.text_input("Topic", placeholder="e.g. Operating Systems, Data Structures")
        difficulty = st.select_slider("Difficulty", options=["easy", "hard"], value="easy")
        num_questions = st.slider("Number of questions", min_value=1, max_value=10, value=5, step=1)

        generate_clicked = st.button("Generate Quiz", type="primary")
        regen_clicked = st.button("Regenerate Quiz")

        if generate_clicked or regen_clicked:
            if not topic.strip():
                st.error("Please provide a topic.")
            elif not os.getenv("OPENAI_API_KEY"):
                st.error("Missing OPENAI_API_KEY. Set it in your environment and retry.")
            else:
                with st.spinner("Crafting quiz..."):
                    try:
                        payload = generate_quiz(topic, num_questions, difficulty)
                        st.session_state.quiz_payload = payload
                    except QuizGenerationError as exc:
                        st.error(f"Could not build a valid quiz. {exc}")
                    except Exception as exc:  # noqa: BLE001
                        st.error(f"Unexpected error: {exc}")

        if st.session_state.get("quiz_payload"):
            st.success("Quiz ready! Select your answers below.")
            render_quiz()
    with right:
        st.markdown(
            "<div class='glass'>"
            "<h4>Tips</h4>"
            "<ul>"
            "<li>Keep topics narrow for sharper questions.</li>"
            "<li>Use regenerate for a fresh variant.</li>"
            "<li>Questions are always validated before display.</li>"
            "</ul>"
            "</div>",
            unsafe_allow_html=True,
        )


if __name__ == "__main__":
    main()
