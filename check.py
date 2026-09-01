import asyncio
import os
import json
from dotenv import load_dotenv
from rocketride import RocketRideClient
from rocketride.schema import Question

load_dotenv()

async def main():
    # Make sure we have a valid key
    if os.environ.get("GEMINI_API_KEY") == "your-gemini-key" or not os.environ.get("GEMINI_API_KEY"):
        print("Skipping check: No valid GEMINI_API_KEY found in .env")
        return

    client = RocketRideClient()
    print("Connecting to RocketRide...")
    await client.connect()

    try:
        print("Starting pipeline...")
        result = await client.use(filepath="pipelines/risk_classification.pipe")
        token = result["token"]
        
        print("Sending chat request...")
        question = Question(expectJson=True)
        question.addInstruction("System", 
            "You are a financial risk analyst. "
            "Analyze the user's situation and determine their risk_level (Conservative, Moderate, Aggressive). "
            "Then, generate an appropriate target_weights portfolio allocation using standard ETFs (e.g. VTI, VXUS, BND). "
            "Return ONLY a JSON object with two keys: 'risk_level' (string) and 'target_weights' (object with tickers as keys and float weights as values, summing to 1.0)."
        )
        question.addQuestion("Client is 35, has $100k, wants to retire at 60, is terrified of losing principal and prefers bonds.")
        
        response = await client.chat(token=token, question=question)
        
        print("Raw response:")
        print(response)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        print("Disconnecting...")
        await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
