from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone


Base = declarative_base()


# ────────────────────────────────────────────
#  Existing tables (preserved)
# ────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)

    clients = relationship("Client", back_populates="advisor")


class RiskQuestionnaire(Base):
    __tablename__ = "risk_questionnaire"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    risk_level = Column(String(20), nullable=False)


# ────────────────────────────────────────────
#  New tables for RebalanceIQ Pro
# ────────────────────────────────────────────

class Client(Base):
    """A client managed by a financial advisor."""
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True)
    advisor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    risk_level = Column(String(20), nullable=False)  # Conservative/Moderate/Aggressive
    initial_investment = Column(Float, nullable=False, default=10000.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    advisor = relationship("User", back_populates="clients")
    portfolio = relationship("ClientPortfolio", back_populates="client", uselist=False)
    drift_alerts = relationship("DriftAlert", back_populates="client")


class ClientPortfolio(Base):
    """Target and current allocations for a client."""
    __tablename__ = "client_portfolios"

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, unique=True)
    target_weights = Column(JSON, nullable=False)   # {"AAPL": 0.15, "MSFT": 0.20, ...}
    current_weights = Column(JSON, nullable=True)   # calculated from market data
    last_rebalanced_at = Column(DateTime, nullable=True)

    client = relationship("Client", back_populates="portfolio")


class BatchRun(Base):
    """A batch drift-check run initiated by an advisor."""
    __tablename__ = "batch_runs"

    id = Column(Integer, primary_key=True)
    advisor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="running")  # running/completed/failed
    total_clients = Column(Integer, default=0)
    processed = Column(Integer, default=0)
    flagged = Column(Integer, default=0)
    errors = Column(Integer, default=0)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    cost_estimate = Column(Float, default=0.0)
    processing_time_seconds = Column(Float, default=0.0)

    alerts = relationship("DriftAlert", back_populates="batch_run")


class DriftAlert(Base):
    """An individual drift alert for a client within a batch run."""
    __tablename__ = "drift_alerts"

    id = Column(Integer, primary_key=True)
    batch_run_id = Column(Integer, ForeignKey("batch_runs.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)

    # Drift data
    drift_percentage = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False)     # low/medium/high/critical
    drift_details = Column(JSON, nullable=True)       # per-asset drift breakdown

    # Pipeline outputs
    analysis = Column(Text, nullable=True)            # from Pipeline 1
    recommendation = Column(Text, nullable=True)      # from Pipeline 1
    market_context = Column(Text, nullable=True)      # from Pipeline 1
    draft_email = Column(Text, nullable=True)         # from Pipeline 2
    compliance_status = Column(String(20), nullable=True)  # pass/fail/review
    compliance_details = Column(Text, nullable=True)  # from Pipeline 3
    confidence_score = Column(Float, nullable=True)   # 0-1

    # Human-in-the-loop
    advisor_action = Column(String(20), default="pending")  # pending/approved/rejected/escalated
    advisor_notes = Column(Text, nullable=True)

    # Error tracking
    error_message = Column(Text, nullable=True)
    pipeline_status = Column(String(20), default="pending")  # pending/running/completed/error

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    batch_run = relationship("BatchRun", back_populates="alerts")
    client = relationship("Client", back_populates="drift_alerts")