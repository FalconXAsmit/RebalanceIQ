RISK_PORTFOLIOS = {
    "Conservative": {
        "MSFT": 0.20,
        "AAPL": 0.15,
        "GOOGL": 0.10,
        "JNJ": 0.15,
        "PG": 0.15,
        "KO": 0.10,
        "BND": 0.15
    },
    "Moderate": {
        "MSFT": 0.20,
        "AAPL": 0.15,
        "GOOGL": 0.15,
        "JNJ": 0.10,
        "PG": 0.10,
        "QQQ": 0.15,
        "SPY": 0.15
    },
    "Aggressive": {
        "MSFT": 0.20,
        "AAPL": 0.20,
        "GOOGL": 0.20,
        "NVDA": 0.15,
        "QQQ": 0.15,
        "SPY": 0.10
    }
}
def get_portfolio(risk_level: str):

    if risk_level not in RISK_PORTFOLIOS:
        raise ValueError("Invalid risk level")

    return RISK_PORTFOLIOS[risk_level]