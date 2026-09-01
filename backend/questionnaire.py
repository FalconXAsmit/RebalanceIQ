"""
Risk questionnaire scoring module.

5 multiple-choice questions, each scored 1-3.
Total score determines risk classification:
  5-8  → Conservative
  9-11 → Moderate
  12-15 → Aggressive
"""

QUESTIONS = [
    {
        "id": 1,
        "question": "What is your investment time horizon?",
        "options": [
            {"text": "Less than 2 years", "score": 1},
            {"text": "2 to 5 years", "score": 2},
            {"text": "More than 5 years", "score": 3},
        ],
    },
    {
        "id": 2,
        "question": "How would you react if your portfolio lost 20% in a month?",
        "options": [
            {"text": "Sell everything immediately", "score": 1},
            {"text": "Wait and watch before deciding", "score": 2},
            {"text": "Buy more at lower prices", "score": 3},
        ],
    },
    {
        "id": 3,
        "question": "How stable is your current income?",
        "options": [
            {"text": "Unstable or uncertain", "score": 1},
            {"text": "Fairly stable", "score": 2},
            {"text": "Very stable with surplus savings", "score": 3},
        ],
    },
    {
        "id": 4,
        "question": "What is your primary investment goal?",
        "options": [
            {"text": "Preserve my capital", "score": 1},
            {"text": "Balanced growth with some safety", "score": 2},
            {"text": "Maximize long-term growth", "score": 3},
        ],
    },
    {
        "id": 5,
        "question": "How comfortable are you with investment risk?",
        "options": [
            {"text": "I prefer safe investments even with lower returns", "score": 1},
            {"text": "I can accept moderate ups and downs", "score": 2},
            {"text": "I am comfortable with high volatility for higher potential returns", "score": 3},
        ],
    },
]

RISK_DESCRIPTIONS = {
    "Conservative": (
        "You prefer stability and capital preservation. "
        "Your portfolio focuses on blue-chip stocks and bonds "
        "with lower volatility."
    ),
    "Moderate": (
        "You seek a balance between growth and safety. "
        "Your portfolio mixes stable stocks with index ETFs "
        "for diversified exposure."
    ),
    "Aggressive": (
        "You aim for maximum growth and can tolerate higher risk. "
        "Your portfolio is tech-heavy with growth-oriented ETFs."
    ),
}


def classify(answers: list[int]) -> dict:
    """
    Classify risk level from a list of 5 answer indices (0-based).

    Parameters
    ----------
    answers : list[int]
        List of 5 integers, each 0-2, representing the selected
        option index for each question.

    Returns
    -------
    dict with keys: risk_level, score, description
    """
    if len(answers) != 5:
        raise ValueError("Exactly 5 answers are required.")

    total_score = 0
    for i, answer_index in enumerate(answers):
        if not (0 <= answer_index <= 2):
            raise ValueError(
                f"Answer for question {i + 1} must be 0, 1, or 2."
            )
        total_score += QUESTIONS[i]["options"][answer_index]["score"]

    if total_score <= 8:
        risk_level = "Conservative"
    elif total_score <= 11:
        risk_level = "Moderate"
    else:
        risk_level = "Aggressive"

    return {
        "risk_level": risk_level,
        "score": total_score,
        "description": RISK_DESCRIPTIONS[risk_level],
    }
