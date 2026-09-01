# RebalanceIQ Pro Backend

RebalanceIQ Pro is a B2B AI-powered SaaS platform built specifically for Financial Advisors. It automates portfolio drift monitoring and leverages multi-agent AI pipelines to generate insights, draft client communications, and perform automated compliance checks.

## Key Features

1. **Batch Orchestration**: Run drift checks across all clients simultaneously, pulling live market data via `yfinance`.
2. **AI-Powered Workflows**: Uses RocketRide (with direct Gemini fallback) for three core pipelines:
   - **Analysis Pipeline**: Analyzes why a portfolio drifted and recommends a rebalancing strategy.
   - **Communication Pipeline**: Drafts a personalized, professional email to the client summarizing the drift and recommendation.
   - **Compliance Pipeline**: Acts as an automated compliance officer to ensure the recommendation aligns with the client's risk profile.
3. **Human-in-the-Loop**: Advisors can review, approve, edit, or reject AI-generated alerts before any action is finalized.
4. **Natural Language Explanations**: Uses AI to explain backtest results (performance vs. benchmark) in plain English.

## Prerequisites

- Python 3.10+
- `uv` package manager (recommended for fast environment setup)

## Setup Instructions

1. **Virtual Environment & Dependencies**:
   Install dependencies using `uv` (or `pip`):
   ```bash
   uv venv
   # On Windows: .\.venv\Scripts\activate
   # On Mac/Linux: source .venv/bin/activate
   uv pip install -e .
   ```
   *(Alternatively, if dependencies are in a requirements.txt or pyproject.toml, just sync the environment).*

2. **Environment Variables**:
   Create a `.env` file in the root directory and add your AI API keys. The backend defaults to Gemini 2.0 Flash if RocketRide isn't configured.
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional: RocketRide Pipeline configuration
   # ROCKETRIDE_URI=your_rocketride_uri
   # ROCKETRIDE_APIKEY=your_rocketride_apikey
   ```

## Running the Backend

The error you might see (`Could not import module "app"`) happens when the command points to the wrong file path. Since our FastAPI instance is named `app` and is located inside `backend/main.py`, run the server with the following command:

```bash
uvicorn backend.main:app --reload
# OR
fastapi dev backend/main.py
```

The API will be available at `http://127.0.0.1:8000`.
You can view the interactive API documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.

## Seeding Demo Data

To quickly test the platform, you can generate a demo advisor and 50 realistic clients with randomized portfolios and risk profiles. Ensure your virtual environment is activated and run:

```bash
python backend/seed_data.py
```

## Core API Endpoints

- **`POST /users`**: Create a new advisor.
- **`POST /clients`**: Create a new client and define their target portfolio weights.
- **`GET /clients`**: List all clients for a specific advisor.
- **`POST /batch/run`**: Trigger the core drift-check engine. This will fetch current market prices, calculate portfolio drift, and run flagged portfolios through the AI pipelines.
- **`GET /alerts/pending`**: Fetch all pending drift alerts that require advisor review.
- **`POST /alerts/{alert_id}/action`**: Approve, reject, or escalate an AI-generated drift alert.