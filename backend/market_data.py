import yfinance as yf
import pandas as pd

def get_historical_data(tickers, start: str, end: str):
    data = yf.download(
        tickers,
        start=start,
        end=end,
        auto_adjust=True
    )
    return data["Close"]

def get_benchmark_data(benchmark: str, start: str, end: str):
    data = yf.download(
        benchmark,
        start=start,
        end=end,
        auto_adjust=True
    )
    return data

def calculate_benchmark_return(data):
    if isinstance(data.columns, pd.MultiIndex):
        close_data = data.xs(
            "Close",
            level=0,
            axis=1
        )
        prices = close_data.iloc[:, 0]
        
    else:
        prices = data["Close"]

    first_price = float(prices.iloc[0])
    last_price = float(prices.iloc[-1])

    return (
        (last_price - first_price)
        / first_price
    ) * 100