import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def explain_backtest(results):

    prompt = f"""
You are explaining the results of a historical portfolio
backtest to a first-time investor.

Use ONLY the data provided below.

BACKTEST RESULTS

Portfolio total return:
{results.portfolio_return:.2f}%

Benchmark:
{results.benchmark_name}

Benchmark total return:
{results.benchmark_return:.2f}%

Difference from benchmark:
{results.difference:.2f} percentage points

Portfolio volatility:
{results.volatility:.2f}%

ASSET PERFORMANCE

{results.asset_performance}

FINAL PORTFOLIO ALLOCATION

{results.final_weights}


Explain the results in simple, clear language.

Your explanation should cover:

1. Overall portfolio performance.
2. Comparison with the benchmark.
3. What the volatility means.
4. Which assets had the strongest and weakest
   historical price performance.
5. How the observed asset performance helps explain
   the portfolio's result.
6. The main takeaway from the backtest.


Rules:

- Use plain language.
- Avoid unnecessary financial jargon.
- Do not simply repeat the numbers.
- Use only the supplied data.
- Do not invent market events or reasons that are
  not present in the supplied data.
- Do not claim that an asset caused a specific amount
  of portfolio return unless that is directly supported
  by the supplied data.
- Do not predict future performance.
- Do not provide personalized financial advice.
- Clearly describe this as a historical backtest.
- Do not use final portfolio weights to infer an asset's contribution to total portfolio return. Only discuss contribution if an explicit contribution value is provided.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3
        )
    )
    print("GEMINI GENERATED")

    return response.text