import pandas as pd

def run_backtest(
    prices: pd.DataFrame,
    weights: dict,
    initial_investment: float,
    rebalance_frequency: int
):
    first_prices = prices.iloc[0]

    holdings = {}
    for ticker, weight in weights.items():
        amount = initial_investment * weight
        holdings[ticker] = amount / first_prices[ticker]
    portfolio_values = []
    asset_value_history = []

    for i, (date, row) in enumerate(prices.iterrows()):
        asset_values = {}
        for ticker, units in holdings.items():
            asset_values[ticker] = (
                units * row[ticker]
            )
        total_value = sum(asset_values.values())

        portfolio_values.append({
            "date": date,
            "portfolio_value": total_value,
            "asset_values": asset_values
        })

        asset_value_history.append({
            "date": date,
            **asset_values
        })

        if i > 0 and i % rebalance_frequency == 0:
            for ticker, weight in weights.items():
                target_value = total_value * weight
                current_price = row[ticker]
                holdings[ticker] = (
                    target_value / current_price
                )

    result = pd.DataFrame(portfolio_values)
    asset_values_df = pd.DataFrame(asset_value_history)

    result["daily_return"] = (
        result["portfolio_value"].pct_change()
    )

    final_value = result["portfolio_value"].iloc[-1]

    total_return = (
        (final_value - initial_investment)
        / initial_investment
    ) * 100

    volatility = (
        result["daily_return"].std()
        * (252 ** 0.5)
        * 100
    )
    
    asset_performance = {}
    for ticker in weights:
        first_price = float(first_prices[ticker])
        last_price = float(prices[ticker].iloc[-1])
        asset_return = (
            (last_price - first_price)
            / first_price
        ) * 100
        asset_performance[ticker] = asset_return


    final_prices = prices.iloc[-1]
    final_asset_values = {}
    for ticker, units in holdings.items():
        final_asset_values[ticker] = (
            units * final_prices[ticker]
        )
    final_total = sum(final_asset_values.values())
    final_weights = {}
    for ticker, value in final_asset_values.items():
        final_weights[ticker] = (
            float(value / final_total * 100)
        )

    asset_contributions = {}
    for ticker in weights:
        start_value = float(
            asset_values_df[ticker].iloc[0]
        )
        end_value = float(
            asset_values_df[ticker].iloc[-1]
        )
        asset_contributions[ticker] = (
            end_value - start_value
        )

    return {
        "portfolio_values": result,
        "final_value": float(final_value),
        "total_return": float(total_return),
        "volatility": float(volatility),
        "asset_performance": asset_performance,
        "final_weights": final_weights,
        "asset_contributions": asset_contributions
    }

def calculate_benchmark_return(data):
    if isinstance(data.columns, pd.MultiIndex):
        close_data = data["Close"]
    else:
        close_data = data["Close"]
    if isinstance(close_data, pd.DataFrame):
        close_data = close_data.iloc[:, 0]
    first_price = float(close_data.iloc[0])
    last_price = float(close_data.iloc[-1])
    benchmark_return = (
        (last_price - first_price)
        / first_price
    ) * 100

    return float(benchmark_return)

def compare_with_benchmark(
    backtest_result,
    benchmark_data,
    benchmark_name
):
    benchmark_return = calculate_benchmark_return(
        benchmark_data
    )
    portfolio_return = float(
        backtest_result["total_return"]
    )
    difference = float(
        portfolio_return - benchmark_return
    )
    volatility = float(
        backtest_result["volatility"]
    )
    return {
        "portfolio_return": portfolio_return,
        "benchmark_return": benchmark_return,
        "difference": difference,
        "volatility": volatility,
        "benchmark_name": benchmark_name,
        "asset_performance": backtest_result[
            "asset_performance"
        ],
        "final_weights": backtest_result[
            "final_weights"
        ]
    }


def serialize_portfolio_history(backtest_result: dict) -> list[dict]:
    """
    Convert the portfolio_values DataFrame from run_backtest()
    into a JSON-serializable list of {date, value} dicts.
    """
    df = backtest_result["portfolio_values"]
    history = []
    for _, row in df.iterrows():
        history.append({
            "date": str(row["date"].date())
            if hasattr(row["date"], "date")
            else str(row["date"]),
            "value": round(float(row["portfolio_value"]), 2),
        })
    return history


def serialize_benchmark_history(
    benchmark_data: pd.DataFrame,
    initial_investment: float,
) -> list[dict]:
    """
    Normalize benchmark close prices to the same initial
    investment amount and return as a JSON-serializable list.
    """
    if isinstance(benchmark_data.columns, pd.MultiIndex):
        close_data = benchmark_data["Close"]
    else:
        close_data = benchmark_data["Close"]

    if isinstance(close_data, pd.DataFrame):
        close_data = close_data.iloc[:, 0]

    first_price = float(close_data.iloc[0])
    history = []
    for date, price in close_data.items():
        normalized = (float(price) / first_price) * initial_investment
        date_str = (
            str(date.date()) if hasattr(date, "date") else str(date)
        )
        history.append({
            "date": date_str,
            "value": round(normalized, 2),
        })
    return history