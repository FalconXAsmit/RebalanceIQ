from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


# ────────────────────────────────────────────
#  Existing schemas (preserved)
# ────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str

class UserResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class QuestionnaireCreate(BaseModel):
    user_id: int
    risk_level: Literal["Conservative", "Moderate", "Aggressive"]

class QuestionnaireResponse(BaseModel):
    id: int
    user_id: int
    risk_level: str

    class Config:
        from_attributes = True

class BacktestRequest(BaseModel):
    initial_investment: float = Field(gt=0)
    start_date: str
    end_date: str
    rebalance_frequency: int = Field(gt=0)
    benchmark: str
    risk_level: str

class ExplanationRequest(BaseModel):
    portfolio_return: float
    benchmark_return: float
    difference: float
    volatility: float
    benchmark_name: str
    asset_performance: dict
    final_weights: dict

class QuestionnaireAnswers(BaseModel):
    answers: list[int] = Field(
        min_length=5,
        max_length=5,
        description="List of 5 answer indices (0-based) for each question"
    )

class RiskClassificationResponse(BaseModel):
    risk_level: str
    score: int
    description: str

class BenchmarkInfo(BaseModel):
    ticker: str
    name: str


# ────────────────────────────────────────────
#  New schemas for RebalanceIQ Pro
# ────────────────────────────────────────────

class ClientCreate(BaseModel):
    advisor_id: int
    name: str
    email: Optional[str] = None
    risk_level: Literal["Conservative", "Moderate", "Aggressive"]
    initial_investment: float = Field(gt=0, default=10000.0)
    target_weights: dict[str, float] = Field(
        description="Target allocation weights, e.g. {'AAPL': 0.15, 'MSFT': 0.20}"
    )

class ClientResponse(BaseModel):
    id: int
    advisor_id: int
    name: str
    email: Optional[str]
    risk_level: str
    initial_investment: float
    target_weights: Optional[dict] = None
    current_weights: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BatchRunCreate(BaseModel):
    advisor_id: int


class BatchRunResponse(BaseModel):
    id: int
    advisor_id: int
    status: str
    total_clients: int
    processed: int
    flagged: int
    errors: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    cost_estimate: float
    processing_time_seconds: float

    class Config:
        from_attributes = True


class DriftAlertResponse(BaseModel):
    id: int
    batch_run_id: int
    client_id: int
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_risk_level: Optional[str] = None

    drift_percentage: float
    severity: str
    drift_details: Optional[dict] = None

    analysis: Optional[str] = None
    recommendation: Optional[str] = None
    market_context: Optional[str] = None
    draft_email: Optional[str] = None
    compliance_status: Optional[str] = None
    compliance_details: Optional[str] = None
    confidence_score: Optional[float] = None

    advisor_action: str
    advisor_notes: Optional[str] = None
    error_message: Optional[str] = None
    pipeline_status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdvisorActionRequest(BaseModel):
    action: Literal["approved", "rejected", "escalated"]
    notes: Optional[str] = None