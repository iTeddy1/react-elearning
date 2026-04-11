QUIZ_CONFIG = {
    "default_model": "google/gemma-4-31b-it:free",
    "temperature": 0.7,
    "system_prompt": (
        "You are an expert technical interviewer and educator. Your task is to "
        "generate high-quality, technically accurate multiple-choice questions. "
        "You must output ONLY a valid JSON object matching the requested schema "
        "exactly. Do not include markdown, greetings, or explanations outside "
        "the JSON."
    ),
    "user_prompt_template": (
        "Generate exactly {num_questions} multiple-choice questions for a "
        "{difficulty} level exam on the technology: {technology}. The main "
        "topic is '{topic}'. Focus specifically on: '{focus_area}'. The "
        "questions and explanations MUST be written entirely in {language}. "
        "Output format: {{\"quiz\": [{{\"question\": \"...\", "
        "\"options\": [\"A\", \"B\", \"C\", \"D\"], "
        "\"correctAnswer\": 0, \"explanation\": \"...\"}}]}}."
    ),
}