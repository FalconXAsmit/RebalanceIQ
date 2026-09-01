from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.ai import explain_backtest
from backend.portfolio import get_portfolio, RISK_PORTFOLIOS
from backend.market_data import get_historical_data, get_benchmark_data
from backend.backtest import (
    run_backtest,
    compare_with_benchmark,
    serialize_portfolio_history,
    serialize_benchmark_history,
)
from backend.database import SessionLocal
from backend.models import (
    Base, User, RiskQuestionnaire,
    Client, ClientPortfolio, BatchRun, DriftAlert,
)
from backend.database import engine
from backend.questionnaire import QUESTIONS, classify
from backend.schemas import (
    UserCreate,
    UserResponse,
    QuestionnaireCreate,
    QuestionnaireResponse,
    QuestionnaireAnswers,
    RiskClassificationResponse,
    BacktestRequest,
    ExplanationRequest,
    BenchmarkInfo,
    ClientCreate,
    ClientResponse,
    BatchRunCreate,
    BatchRunResponse,
    DriftAlertResponse,
    AdvisorActionRequest,
)

app = FastAPI(
    title="RebalanceIQ Pro",
    description="AI-Powered Portfolio Intelligence Platform for Financial Advisors",
    version="2.0.0",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB table creation on startup ---
Base.metadata.create_all(bind=engine)

# --- Available benchmarks ---
BENCHMARKS = [
    {"ticker": "^GSPC", "name": "S&P 500"},
    {"ticker": "^NSEI", "name": "Nifty 50"},
    {"ticker": "^IXIC", "name": "NASDAQ Composite"},
    {"ticker": "^DJI", "name": "Dow Jones Industrial Average"},
]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "RebalanceIQ Pro backend is running"}


# ────────────────────────────────────────────
#  User endpoints (preserved)
# ────────────────────────────────────────────

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(name=user.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/questionnaire", response_model=QuestionnaireResponse)
def create_questionnaire(
    questionnaire: QuestionnaireCreate,
    db: Session = Depends(get_db)
):
    new_questionnaire = RiskQuestionnaire(
        user_id=questionnaire.user_id,
        risk_level=questionnaire.risk_level
    )
    db.add(new_questionnaire)
    db.commit()
    db.refresh(new_questionnaire)
    return new_questionnaire


# ────────────────────────────────────────────
#  Questionnaire & risk scoring
# ────────────────────────────────────────────

@app.get("/questionnaire/questions")
def get_questions():
    """Return the risk questionnaire questions and options."""
    return QUESTIONS


@app.post(
    "/questionnaire/score",
    response_model=RiskClassificationResponse,
)
def score_questionnaire(payload: QuestionnaireAnswers):
    """Score the questionnaire answers and return a risk classification."""
    try:
        result = classify(payload.answers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


# ────────────────────────────────────────────
#  Benchmarks & risk profiles
# ────────────────────────────────────────────

@app.get("/benchmarks", response_model=list[BenchmarkInfo])
def list_benchmarks():
    """Return the list of available benchmark indices."""
    return BENCHMARKS


@app.get("/risk-profiles")
def list_risk_profiles():
    """Return the available risk profiles and their portfolio compositions."""
    return RISK_PORTFOLIOS


# ────────────────────────────────────────────
#  Backtest (preserved)
# ────────────────────────────────────────────

@app.post("/backtest")
def create_backtest(request: BacktestRequest):
    try:
        weights = get_portfolio(request.risk_level)
        tickers = list(weights.keys())
        portfolio_data = get_historical_data(
            tickers, request.start_date, request.end_date
        )
        benchmark_data = get_benchmark_data(
            request.benchmark, request.start_date, request.end_date
        )
        if portfolio_data.empty:
            raise HTTPException(
                status_code=400,
                detail="No portfolio data found for the selected dates."
            )
        if benchmark_data.empty:
            raise HTTPException(
                status_code=400,
                detail="No benchmark data found for the selected dates."
            )
        result = run_backtest(
            portfolio_data, weights,
            request.initial_investment, request.rebalance_frequency
        )
        comparison = compare_with_benchmark(
            result, benchmark_data, request.benchmark
        )

        portfolio_history = serialize_portfolio_history(result)
        benchmark_history = serialize_benchmark_history(
            benchmark_data, request.initial_investment
        )

        explanation_request = ExplanationRequest(
            portfolio_return=comparison["portfolio_return"],
            benchmark_return=comparison["benchmark_return"],
            difference=comparison["difference"],
            volatility=comparison["volatility"],
            benchmark_name=comparison["benchmark_name"],
            asset_performance=comparison["asset_performance"],
            final_weights=comparison["final_weights"]
        )
        explanation = explain_backtest(explanation_request)
        return {
            "risk_level": request.risk_level,
            "portfolio": weights,
            "results": comparison,
            "explanation": explanation,
            "portfolio_history": portfolio_history,
            "benchmark_history": benchmark_history,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain")
def explain_results(request: ExplanationRequest):
    explanation = explain_backtest(request)
    return {"explanation": explanation}


# ────────────────────────────────────────────
#  Client Management (NEW)
# ────────────────────────────────────────────

@app.get("/clients")
def list_clients(
    advisor_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """List all clients for a given advisor."""
    clients = db.query(Client).filter(Client.advisor_id == advisor_id).all()
    result = []
    for c in clients:
        portfolio = db.query(ClientPortfolio).filter(
            ClientPortfolio.client_id == c.id
        ).first()
        result.append({
            "id": c.id,
            "advisor_id": c.advisor_id,
            "name": c.name,
            "email": c.email,
            "risk_level": c.risk_level,
            "initial_investment": c.initial_investment,
            "target_weights": portfolio.target_weights if portfolio else None,
            "current_weights": portfolio.current_weights if portfolio else None,
            "created_at": c.created_at,
        })
    return result


@app.post("/clients")
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client with a target portfolio."""
    # Validate weights sum to ~1.0
    weight_sum = sum(payload.target_weights.values())
    if abs(weight_sum - 1.0) > 0.02:
        raise HTTPException(
            status_code=400,
            detail=f"Target weights must sum to 1.0 (got {weight_sum:.4f})"
        )

    client = Client(
        advisor_id=payload.advisor_id,
        name=payload.name,
        email=payload.email,
        risk_level=payload.risk_level,
        initial_investment=payload.initial_investment,
    )
    db.add(client)
    db.flush()

    portfolio = ClientPortfolio(
        client_id=client.id,
        target_weights=payload.target_weights,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(client)

    return {
        "id": client.id,
        "name": client.name,
        "risk_level": client.risk_level,
        "message": "Client created successfully"
    }


@app.get("/clients/{client_id}")
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get a single client with portfolio details."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    portfolio = db.query(ClientPortfolio).filter(
        ClientPortfolio.client_id == client.id
    ).first()

    return {
        "id": client.id,
        "advisor_id": client.advisor_id,
        "name": client.name,
        "email": client.email,
        "risk_level": client.risk_level,
        "initial_investment": client.initial_investment,
        "target_weights": portfolio.target_weights if portfolio else None,
        "current_weights": portfolio.current_weights if portfolio else None,
        "created_at": client.created_at,
    }


# ────────────────────────────────────────────
#  Batch Drift Check (NEW)
# ────────────────────────────────────────────

@app.post("/batch/run")
async def start_batch_run(payload: BatchRunCreate, db: Session = Depends(get_db)):
    """
    Start a batch drift-check run for all clients of an advisor.
    This is the core feature of RebalanceIQ Pro.
    """
    from backend.batch_orchestrator import run_batch_drift_check

    # Validate advisor exists
    advisor = db.query(User).filter(User.id == payload.advisor_id).first()
    if not advisor:
        raise HTTPException(status_code=404, detail="Advisor not found")

    # Count clients
    client_count = db.query(Client).filter(
        Client.advisor_id == payload.advisor_id
    ).count()
    if client_count == 0:
        raise HTTPException(
            status_code=400,
            detail="No clients found for this advisor. Seed data first."
        )

    # Run batch (this does the heavy lifting)
    try:
        result = await run_batch_drift_check(payload.advisor_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/batch/runs")
def list_batch_runs(
    advisor_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """List all batch runs for an advisor."""
    runs = db.query(BatchRun).filter(
        BatchRun.advisor_id == advisor_id
    ).order_by(BatchRun.started_at.desc()).all()
    return [
        {
            "id": r.id,
            "status": r.status,
            "total_clients": r.total_clients,
            "processed": r.processed,
            "flagged": r.flagged,
            "errors": r.errors,
            "cost_estimate": r.cost_estimate,
            "processing_time_seconds": r.processing_time_seconds,
            "started_at": r.started_at,
            "completed_at": r.completed_at,
        }
        for r in runs
    ]


@app.get("/batch/runs/{run_id}")
def get_batch_run(run_id: int, db: Session = Depends(get_db)):
    """Get details of a specific batch run including all alerts."""
    run = db.query(BatchRun).filter(BatchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Batch run not found")

    alerts = db.query(DriftAlert).filter(
        DriftAlert.batch_run_id == run_id
    ).order_by(DriftAlert.drift_percentage.desc()).all()

    alert_list = []
    for a in alerts:
        client = db.query(Client).filter(Client.id == a.client_id).first()
        alert_list.append({
            "id": a.id,
            "client_id": a.client_id,
            "client_name": client.name if client else "Unknown",
            "client_email": client.email if client else None,
            "client_risk_level": client.risk_level if client else None,
            "drift_percentage": a.drift_percentage,
            "severity": a.severity,
            "drift_details": a.drift_details,
            "analysis": a.analysis,
            "recommendation": a.recommendation,
            "market_context": a.market_context,
            "draft_email": a.draft_email,
            "compliance_status": a.compliance_status,
            "compliance_details": a.compliance_details,
            "confidence_score": a.confidence_score,
            "advisor_action": a.advisor_action,
            "advisor_notes": a.advisor_notes,
            "error_message": a.error_message,
            "pipeline_status": a.pipeline_status,
            "created_at": a.created_at,
        })

    return {
        "run": {
            "id": run.id,
            "status": run.status,
            "total_clients": run.total_clients,
            "processed": run.processed,
            "flagged": run.flagged,
            "errors": run.errors,
            "cost_estimate": run.cost_estimate,
            "processing_time_seconds": run.processing_time_seconds,
            "started_at": run.started_at,
            "completed_at": run.completed_at,
        },
        "alerts": alert_list,
    }


# ────────────────────────────────────────────
#  Advisor Review (NEW)
# ────────────────────────────────────────────

@app.get("/alerts/pending")
def get_pending_alerts(
    advisor_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Get all pending drift alerts for an advisor to review."""
    alerts = (
        db.query(DriftAlert)
        .join(Client)
        .filter(
            Client.advisor_id == advisor_id,
            DriftAlert.advisor_action == "pending",
            DriftAlert.pipeline_status == "completed",
        )
        .order_by(DriftAlert.drift_percentage.desc())
        .all()
    )

    result = []
    for a in alerts:
        client = db.query(Client).filter(Client.id == a.client_id).first()
        result.append({
            "id": a.id,
            "client_name": client.name if client else "Unknown",
            "client_email": client.email if client else None,
            "client_risk_level": client.risk_level if client else None,
            "drift_percentage": a.drift_percentage,
            "severity": a.severity,
            "analysis": a.analysis,
            "recommendation": a.recommendation,
            "market_context": a.market_context,
            "draft_email": a.draft_email,
            "compliance_status": a.compliance_status,
            "compliance_details": a.compliance_details,
            "confidence_score": a.confidence_score,
            "advisor_action": a.advisor_action,
            "created_at": a.created_at,
        })
    return result


@app.post("/alerts/{alert_id}/action")
def take_action_on_alert(
    alert_id: int,
    payload: AdvisorActionRequest,
    db: Session = Depends(get_db)
):
    """Approve, reject, or escalate a drift alert."""
    alert = db.query(DriftAlert).filter(DriftAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # If compliance failed, require justification for approval
    if (
        payload.action == "approved"
        and alert.compliance_status == "fail"
        and not payload.notes
    ):
        raise HTTPException(
            status_code=400,
            detail="Compliance check failed. You must provide justification notes to override."
        )

    alert.advisor_action = payload.action
    alert.advisor_notes = payload.notes
    db.commit()

    return {
        "message": f"Alert {alert_id} marked as {payload.action}",
        "alert_id": alert_id,
        "action": payload.action,
    }


# ────────────────────────────────────────────
#  Dashboard Stats (NEW)
# ────────────────────────────────────────────

@app.get("/dashboard/stats")
def get_dashboard_stats(
    advisor_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Get dashboard summary statistics for an advisor."""
    total_clients = db.query(Client).filter(
        Client.advisor_id == advisor_id
    ).count()

    pending_alerts = (
        db.query(DriftAlert)
        .join(Client)
        .filter(
            Client.advisor_id == advisor_id,
            DriftAlert.advisor_action == "pending",
        )
        .count()
    )

    latest_run = (
        db.query(BatchRun)
        .filter(BatchRun.advisor_id == advisor_id)
        .order_by(BatchRun.started_at.desc())
        .first()
    )

    risk_counts = {}
    for rl in ["Conservative", "Moderate", "Aggressive"]:
        risk_counts[rl] = db.query(Client).filter(
            Client.advisor_id == advisor_id,
            Client.risk_level == rl,
        ).count()

    return {
        "total_clients": total_clients,
        "pending_alerts": pending_alerts,
        "risk_distribution": risk_counts,
        "latest_batch_run": {
            "id": latest_run.id,
            "status": latest_run.status,
            "total_clients": latest_run.total_clients,
            "flagged": latest_run.flagged,
            "cost_estimate": latest_run.cost_estimate,
            "processing_time_seconds": latest_run.processing_time_seconds,
            "completed_at": latest_run.completed_at,
        } if latest_run else None,
    }


@app.get("/health")
def health():
    return {"status": "ok"}