import asyncio
import os
import json
from dotenv import load_dotenv
from rocketride import RocketRideClient

from backend.database import SessionLocal, engine
from backend.models import Base, User, PendingReview

load_dotenv()

Base.metadata.create_all(bind=engine)

# Dummy drift data for batch processing
DUMMY_BATCH = [
    {
        "user_name": "Alice Smith",
        "target_risk": "Moderate",
        "current_allocation": {"^GSPC": "70%", "^IXIC": "30%"},
        "target_allocation": {"^GSPC": "50%", "^IXIC": "10%", "BND": "40%"},
        "drift_percentage": "25%"
    },
    {
        "user_name": "Bob Johnson",
        "target_risk": "Conservative",
        "current_allocation": {"^GSPC": "50%", "^IXIC": "50%"},
        "target_allocation": {"^GSPC": "20%", "BND": "80%"},
        "drift_percentage": "60%"
    }
]

async def process_drift(client, token, data: dict):
    prompt_data = (
        f"Client Name: {data['user_name']}\n"
        f"Target Risk Profile: {data['target_risk']}\n"
        f"Current Allocation: {data['current_allocation']}\n"
        f"Target Allocation: {data['target_allocation']}\n"
        f"Drift: {data['drift_percentage']}\n"
    )
    # Send the data to the RocketRide pipeline
    out = await client.send(
        token, 
        prompt_data,
        objinfo={"name": f"{data['user_name']}_drift.txt"},
        mimetype="text/plain"
    )
    return out

async def main():
    db = SessionLocal()

    # Ensure users exist for our dummy data
    for item in DUMMY_BATCH:
        user = db.query(User).filter(User.name == item["user_name"]).first()
        if not user:
            user = User(name=item["user_name"])
            db.add(user)
            db.commit()
            db.refresh(user)

    print("Connecting to RocketRide engine...")
    uri = os.environ.get('ROCKETRIDE_URI', 'ws://localhost:5565')
    auth = os.environ.get('ROCKETRIDE_APIKEY', '')

    try:
        async with RocketRideClient(uri=uri, auth=auth) as rr_client:
            # We assume the rebalance.pipe file is in the same directory
            pipe_path = os.path.join(os.path.dirname(__file__), 'rebalance.pipe')
            result = await rr_client.use(filepath=pipe_path)
            token = result['token']
            
            try:
                print(f"Processing batch of {len(DUMMY_BATCH)} portfolios...")
                for item in DUMMY_BATCH:
                    print(f"Analyzing drift for {item['user_name']}...")
                    email_content = await process_drift(rr_client, token, item)
                    
                    user = db.query(User).filter(User.name == item["user_name"]).first()
                    
                    # Create pending review
                    review = PendingReview(
                        user_id=user.id,
                        drift_details=json.dumps(item),
                        generated_email=email_content
                    )
                    db.add(review)
                
                db.commit()
                print("Batch processing complete. Emails are queued for advisor review.")
            finally:
                await rr_client.terminate(token)
    except Exception as e:
        print(f"Error during RocketRide processing: {e}")
        print("Note: If the RocketRide engine is not running locally, make sure you have the VS Code extension connected in Local mode.")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
