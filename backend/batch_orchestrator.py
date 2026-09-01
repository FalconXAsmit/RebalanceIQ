"""
Batch Orchestrator  the core engine of RebalanceIQ Pro.

Processes all clients for an advisor:
1. Fetches current market prices
2. Calculates portfolio drift
3. Sends drifted portfolios through RocketRide pipelines
4. Stores results for advisor review
"""

import asyncio
import json
import os
import time
from datetime import datetime, timezone

from dotenv import load_dotenv
from sqlalchemy.orm import Session

load_dotenv()

# We import these at function-call time to avoid circular imports
# with main.py, but define the core logic here.

DRIFT_THRESHOLD_LOW = 5.0
DRIFT_THRESHOLD_MEDIUM = 15.0
DRIFT_THRESHOLD_HIGH = 30.0

COST_PER_ANALYSIS = 0.02   # Pipeline 1
COST_PER_EMAIL = 0.005     # Pipeline 2
COST_PER_COMPLIANCE = 0.003  # Pipeline 3
COST_PER_CLIENT = COST_PER_ANALYSIS + COST_PER_EMAIL + COST_PER_COMPLIANCE


def classify_severity(drift_pct: float) -> str:
    """Classify drift severity based on thresholds."""
    if drift_pct < DRIFT_THRESHOLD_LOW:
        return "low"
    elif drift_pct < DRIFT_THRESHOLD_MEDIUM:
        return "medium"
    elif drift_pct < DRIFT_THRESHOLD_HIGH:
        return "high"
    else:
        return "critical"


def calculate_drift(target_weights: dict, current_weights: dict) -> tuple[float, dict]:
    """
    Calculate portfolio drift as the average absolute deviation
    from target weights across all assets.

    Returns (drift_percentage, per_asset_drift_dict).
    """
    drift_details = {}
    total_drift = 0.0
    count = 0

    all_tickers = set(list(target_weights.keys()) + list(current_weights.keys()))

    for ticker in all_tickers:
        target = target_weights.get(ticker, 0.0)
        current = current_weights.get(ticker, 0.0)
        asset_drift = abs(current - target) * 100  # as percentage points
        drift_details[ticker] = {
            "target": round(target * 100, 2),
            "current": round(current * 100, 2),
            "drift": round(asset_drift, 2),
        }
        total_drift += asset_drift
        count += 1

    avg_drift = total_drift / max(count, 1)
    return round(avg_drift, 2), drift_details


def calculate_current_weights(
    target_weights: dict,
    initial_investment: float,
    prices_start: dict,
    prices_current: dict,
) -> dict:
    """
    Given target weights and price changes, calculate what the current
    weights have drifted to (simulating buy-and-hold from initial allocation).
    """
    current_values = {}
    for ticker, weight in target_weights.items():
        start_price = prices_start.get(ticker)
        current_price = prices_current.get(ticker)
        if start_price and current_price and start_price > 0:
            # How much was invested in this asset
            invested = initial_investment * weight
            # How many shares
            shares = invested / start_price
            # Current value
            current_values[ticker] = shares * current_price
        else:
            # Ticker data unavailable, assume no change
            current_values[ticker] = initial_investment * weight

    total = sum(current_values.values())
    if total == 0:
        return target_weights  # fallback

    return {t: round(v / total, 4) for t, v in current_values.items()}


async def run_pipeline_analysis(client_data: dict) -> dict:
    """
    Send client data through RocketRide Pipeline 1 (portfolio analysis).
    Falls back to Gemini direct call if RocketRide is unavailable.
    """
    uri = os.environ.get("ROCKETRIDE_URI", "")
    apikey = os.environ.get("ROCKETRIDE_APIKEY", "")

    prompt = f"""Analyze this portfolio drift for a financial advisor:

Client: {client_data['client_name']}
Risk Profile: {client_data['risk_level']}
Initial Investment: ${client_data['initial_investment']:,.2f}
Drift Severity: {client_data['severity']} ({client_data['drift_percentage']:.1f}%)

Per-asset drift:
{json.dumps(client_data['drift_details'], indent=2)}

Provide:
1. ANALYSIS: A brief analysis of why this portfolio has drifted (2-3 sentences)
2. MARKET_CONTEXT: Brief relevant market context (2-3 sentences)
3. RECOMMENDATION: Specific rebalancing recommendation (2-3 sentences)

Format your response as:
ANALYSIS: ...
MARKET_CONTEXT: ...
RECOMMENDATION: ...
"""

    # Try RocketRide first
    if uri and apikey:
        try:
            from rocketride import RocketRideClient
            pipe_path = os.path.join(
                os.path.dirname(__file__), "..", "pipelines", "portfolio_analysis.pipe"
            )
            if os.path.exists(pipe_path):
                async with RocketRideClient(uri=uri, auth=apikey) as rr:
                    result = await rr.use(filepath=pipe_path)
                    token = result["token"]
                    try:
                        response = await rr.send(
                            token, prompt,
                            objinfo={"name": f"{client_data['client_name']}_analysis.txt"},
                            mimetype="text/plain",
                        )
                        return parse_analysis_response(response)
                    finally:
                        await rr.terminate(token)
        except Exception as e:
            print(f"  [WARN] RocketRide pipeline failed, falling back to Gemini: {e}")

    # Fallback: direct Gemini call
    return await gemini_analysis(prompt)


async def gemini_analysis(prompt: str) -> dict:
    """Fallback: use Gemini directly if RocketRide is unavailable."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.3),
    )
    return parse_analysis_response(response.text)


def parse_analysis_response(text: str) -> dict:
    """Parse structured response from LLM."""
    result = {"analysis": "", "market_context": "", "recommendation": ""}

    if not text:
        return result

    text = str(text)
    sections = {"ANALYSIS:": "analysis", "MARKET_CONTEXT:": "market_context", "RECOMMENDATION:": "recommendation"}

    for marker, key in sections.items():
        if marker in text:
            start = text.index(marker) + len(marker)
            # Find the next marker or end of text
            end = len(text)
            for other_marker in sections:
                if other_marker != marker and other_marker in text:
                    other_start = text.index(other_marker)
                    if other_start > start and other_start < end:
                        end = other_start
            result[key] = text[start:end].strip()

    # If parsing failed, put everything in analysis
    if not any(result.values()):
        result["analysis"] = text[:500]
        result["recommendation"] = "Please review this portfolio manually."

    return result


async def generate_email(client_data: dict, analysis: dict) -> str:
    """Generate a personalized client email using Pipeline 2 or Gemini fallback."""
    prompt = f"""Write a brief, professional email to a client about their portfolio rebalancing.

Client Name: {client_data['client_name']}
Risk Profile: {client_data['risk_level']}
Drift: {client_data['drift_percentage']:.1f}%
Recommendation: {analysis.get('recommendation', 'Rebalancing recommended')}

The email should:
- Be addressed to the client by first name
- Briefly explain that their portfolio has drifted from target
- Summarize the recommendation
- Be warm but professional
- Be 4-6 sentences
- NOT give specific financial advice
- End with a note to contact their advisor for questions

Do NOT include a subject line. Just the email body.
"""

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.4),
    )
    return response.text


async def check_compliance(client_data: dict, recommendation: str) -> dict:
    """Check recommendation against suitability rules using Pipeline 3 or Gemini."""
    prompt = f"""You are a compliance officer reviewing a portfolio rebalancing recommendation.

Client Risk Profile: {client_data['risk_level']}
Recommendation: {recommendation}

Check if this recommendation is suitable for the client's risk profile.

Rules:
- Conservative clients should NOT be recommended aggressive growth stocks or high-volatility assets
- Aggressive clients should NOT be pushed toward overly conservative bond-heavy portfolios
- All recommendations must be within the client's stated risk tolerance

Respond with exactly:
STATUS: PASS or FAIL or REVIEW
CONFIDENCE: a number between 0.0 and 1.0
DETAILS: Brief explanation (1-2 sentences)
"""

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.1),
    )

    text = response.text
    result = {"status": "review", "confidence": 0.5, "details": text}

    if "STATUS:" in text:
        status_line = text.split("STATUS:")[1].split("\n")[0].strip().lower()
        if "pass" in status_line:
            result["status"] = "pass"
        elif "fail" in status_line:
            result["status"] = "fail"
        else:
            result["status"] = "review"

    if "CONFIDENCE:" in text:
        try:
            conf_str = text.split("CONFIDENCE:")[1].split("\n")[0].strip()
            result["confidence"] = float(conf_str)
        except (ValueError, IndexError):
            result["confidence"] = 0.5

    if "DETAILS:" in text:
        result["details"] = text.split("DETAILS:")[1].strip()

    return result


async def process_single_client(
    client_data: dict,
    db: Session,
    batch_run_id: int,
    alert_id: int,
) -> dict:
    """Process a single client through all 3 pipelines."""
    from backend.models import DriftAlert

    alert = db.query(DriftAlert).filter(DriftAlert.id == alert_id).first()
    if not alert:
        return {"error": "Alert not found"}

    try:
        alert.pipeline_status = "running"
        db.commit()

        severity = client_data["severity"]

        # CRITICAL drift: refuse to auto-recommend
        if severity == "critical":
            alert.analysis = (
                f"CRITICAL DRIFT DETECTED ({client_data['drift_percentage']:.1f}%). "
                "This portfolio has deviated significantly from target allocation. "
                "Automated recommendation is NOT appropriate for this level of drift."
            )
            alert.recommendation = (
                "ESCALATED: Manual analysis required. The system cannot provide "
                "an automated recommendation for drift exceeding 30%. "
                "Please review the portfolio manually."
            )
            alert.market_context = "Manual review required."
            alert.draft_email = None
            alert.compliance_status = "review"
            alert.compliance_details = "Escalated due to critical drift level."
            alert.confidence_score = 0.0
            alert.advisor_action = "escalated"
            alert.pipeline_status = "completed"
            db.commit()
            return {"status": "escalated"}

        # Pipeline 1: Analysis
        print(f"    [ANALYSIS] Running analysis for {client_data['client_name']}...")
        analysis = await run_pipeline_analysis(client_data)
        alert.analysis = analysis.get("analysis", "")
        alert.recommendation = analysis.get("recommendation", "")
        alert.market_context = analysis.get("market_context", "")
        db.commit()

        # Pipeline 2: Email draft
        print(f"      Drafting email for {client_data['client_name']}...")
        email = await generate_email(client_data, analysis)
        alert.draft_email = email
        db.commit()

        # Pipeline 3: Compliance check
        print(f"    [OK] Compliance check for {client_data['client_name']}...")
        compliance = await check_compliance(
            client_data, analysis.get("recommendation", "")
        )
        alert.compliance_status = compliance["status"]
        alert.compliance_details = compliance["details"]
        alert.confidence_score = compliance["confidence"]
        alert.pipeline_status = "completed"
        db.commit()

        return {"status": "completed", "compliance": compliance["status"]}

    except Exception as e:
        alert.pipeline_status = "error"
        alert.error_message = str(e)[:500]
        db.commit()
        return {"status": "error", "error": str(e)}


async def run_batch_drift_check(advisor_id: int, db: Session) -> dict:
    """
    The main batch processing function.
    Checks all clients for drift and processes flagged ones through pipelines.
    """
    import yfinance as yf
    from backend.models import Client, ClientPortfolio, BatchRun, DriftAlert

    start_time = time.time()

    # Create batch run record
    clients = db.query(Client).filter(Client.advisor_id == advisor_id).all()
    batch_run = BatchRun(
        advisor_id=advisor_id,
        status="running",
        total_clients=len(clients),
    )
    db.add(batch_run)
    db.commit()
    db.refresh(batch_run)

    print(f"\n{'='*60}")
    print(f"[START] BATCH DRIFT CHECK  {len(clients)} clients")
    print(f"{'='*60}")

    # Step 1: Collect all unique tickers across all portfolios
    all_tickers = set()
    client_portfolios = {}
    for client in clients:
        portfolio = db.query(ClientPortfolio).filter(
            ClientPortfolio.client_id == client.id
        ).first()
        if portfolio and portfolio.target_weights:
            client_portfolios[client.id] = portfolio
            all_tickers.update(portfolio.target_weights.keys())

    # Step 2: Fetch current market data for all tickers at once
    print(f"\n[DATA] Fetching market data for {len(all_tickers)} tickers...")
    try:
        tickers_list = list(all_tickers)
        data = yf.download(tickers_list, period="6mo", auto_adjust=True)
        if data.empty:
            batch_run.status = "failed"
            db.commit()
            return {"error": "Failed to fetch market data"}

        close_data = data["Close"]

        # Get start and current prices
        prices_start = {}
        prices_current = {}
        for ticker in tickers_list:
            col = close_data[ticker] if isinstance(close_data, type(data)) else close_data
            if hasattr(col, 'columns') and ticker in col.columns:
                series = col[ticker].dropna()
            elif hasattr(close_data, '__getitem__'):
                try:
                    series = close_data[ticker].dropna()
                except (KeyError, TypeError):
                    continue
            else:
                continue

            if len(series) >= 2:
                prices_start[ticker] = float(series.iloc[0])
                prices_current[ticker] = float(series.iloc[-1])

        print(f"   [OK] Got prices for {len(prices_current)}/{len(tickers_list)} tickers")

    except Exception as e:
        print(f"   [ERR] Market data error: {e}")
        batch_run.status = "failed"
        db.commit()
        return {"error": f"Market data fetch failed: {str(e)}"}

    # Step 3: Calculate drift for each client
    print(f"\n[CALC] Calculating drift for {len(clients)} clients...")
    flagged_clients = []
    skipped = 0

    for client in clients:
        portfolio = client_portfolios.get(client.id)
        if not portfolio:
            skipped += 1
            continue

        target = portfolio.target_weights
        current = calculate_current_weights(
            target, client.initial_investment, prices_start, prices_current
        )

        # Update current weights in DB
        portfolio.current_weights = current
        db.commit()

        drift_pct, drift_details = calculate_drift(target, current)
        severity = classify_severity(drift_pct)

        if severity != "low":
            # Create drift alert
            alert = DriftAlert(
                batch_run_id=batch_run.id,
                client_id=client.id,
                drift_percentage=drift_pct,
                severity=severity,
                drift_details=drift_details,
                pipeline_status="pending",
            )
            db.add(alert)
            db.flush()

            flagged_clients.append({
                "alert_id": alert.id,
                "client_id": client.id,
                "client_name": client.name,
                "client_email": client.email,
                "risk_level": client.risk_level,
                "initial_investment": client.initial_investment,
                "drift_percentage": drift_pct,
                "severity": severity,
                "drift_details": drift_details,
            })

    db.commit()
    print(f"   Flagged: {len(flagged_clients)} | Skipped: {skipped} | OK: {len(clients) - len(flagged_clients) - skipped}")

    # Step 4: Process flagged clients through AI pipelines
    batch_run.flagged = len(flagged_clients)
    db.commit()

    if flagged_clients:
        print(f"\n[AI] Processing {len(flagged_clients)} flagged clients through AI pipelines...")
        processed = 0
        errors = 0

        # Process sequentially to avoid rate limits and keep output readable
        for i, client_data in enumerate(flagged_clients):
            print(f"\n  [{i+1}/{len(flagged_clients)}] {client_data['client_name']} "
                  f"({client_data['severity'].upper()}  {client_data['drift_percentage']:.1f}%)")

            result = await process_single_client(
                client_data, db, batch_run.id, client_data["alert_id"]
            )

            if result.get("status") == "error":
                errors += 1
            processed += 1

            batch_run.processed = processed
            batch_run.errors = errors
            db.commit()

    # Step 5: Finalize batch run
    elapsed = time.time() - start_time
    total_cost = len(flagged_clients) * COST_PER_CLIENT

    batch_run.status = "completed"
    batch_run.processed = len(flagged_clients)
    batch_run.completed_at = datetime.now(timezone.utc)
    batch_run.cost_estimate = round(total_cost, 4)
    batch_run.processing_time_seconds = round(elapsed, 2)
    db.commit()

    summary = {
        "batch_run_id": batch_run.id,
        "status": "completed",
        "total_clients": len(clients),
        "flagged": len(flagged_clients),
        "processed": batch_run.processed,
        "errors": batch_run.errors,
        "cost_estimate": f"${total_cost:.2f}",
        "processing_time": f"{elapsed:.1f}s",
        "severity_breakdown": {
            "critical": sum(1 for c in flagged_clients if c["severity"] == "critical"),
            "high": sum(1 for c in flagged_clients if c["severity"] == "high"),
            "medium": sum(1 for c in flagged_clients if c["severity"] == "medium"),
        },
    }

    print(f"\n{'='*60}")
    print(f"[OK] BATCH COMPLETE")
    print(f"   Clients: {len(clients)} | Flagged: {len(flagged_clients)} | Errors: {batch_run.errors}")
    print(f"   Time: {elapsed:.1f}s | Cost: ${total_cost:.2f}")
    print(f"{'='*60}\n")

    return summary
