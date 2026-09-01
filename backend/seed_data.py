"""
Seed script: generates 50 sample clients with varied risk profiles
and portfolio allocations for demo purposes.

Usage:
    python backend/seed_data.py
"""

import random
from backend.database import SessionLocal, engine
from backend.models import Base, User, Client, ClientPortfolio
from backend.portfolio import RISK_PORTFOLIOS

# Sample client names
FIRST_NAMES = [
    "Alice", "Bob", "Carol", "David", "Eva", "Frank", "Grace", "Henry",
    "Iris", "Jack", "Karen", "Leo", "Mia", "Nathan", "Olivia", "Peter",
    "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier",
    "Yara", "Zane", "Amit", "Priya", "Ravi", "Sneha", "Arjun", "Deepa",
    "Kiran", "Neha", "Rohan", "Sima", "Tanvi", "Uday", "Vikram", "Ananya",
    "Bharat", "Chitra", "Dinesh", "Ekta", "Gaurav", "Harini", "Ishaan",
    "Jaya", "Kunal", "Lakshmi"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Kumar", "Sharma", "Patel", "Singh",
    "Gupta", "Verma", "Reddy", "Iyer", "Nair", "Joshi", "Mehta", "Shah",
    "Rao", "Desai", "Bhat", "Menon", "Pillai", "Srinivasan", "Agarwal",
    "Chopra", "Kapoor", "Malhotra", "Banerjee", "Sen", "Das", "Mukherjee",
    "Ghosh", "Roy", "Bose", "Dutta", "Mishra", "Tiwari", "Pandey",
    "Saxena", "Chauhan", "Yadav", "Thakur", "Jain", "Goel", "Khanna"
]

RISK_LEVELS = ["Conservative", "Moderate", "Aggressive"]
RISK_DISTRIBUTION = [0.3, 0.45, 0.25]  # 30% conservative, 45% moderate, 25% aggressive


def add_noise_to_weights(base_weights: dict, noise_factor: float = 0.05) -> dict:
    """
    Add small random noise to target weights so each client has
    a slightly different allocation (more realistic).
    """
    noisy = {}
    for ticker, weight in base_weights.items():
        noisy[ticker] = max(0.02, weight + random.uniform(-noise_factor, noise_factor))

    # Normalize to sum to 1.0
    total = sum(noisy.values())
    return {t: round(w / total, 4) for t, w in noisy.items()}


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if we already have seeded data
        existing_clients = db.query(Client).count()
        if existing_clients >= 50:
            print(f"Already have {existing_clients} clients. Skipping seed.")
            return

        # Create or get advisor user
        advisor = db.query(User).filter(User.name == "Demo Advisor").first()
        if not advisor:
            advisor = User(name="Demo Advisor")
            db.add(advisor)
            db.commit()
            db.refresh(advisor)
            print(f"Created advisor: {advisor.name} (id={advisor.id})")

        # Generate 50 clients
        random.seed(42)  # Reproducible demo data
        used_names = set()

        for i in range(50):
            # Generate unique name
            while True:
                first = random.choice(FIRST_NAMES)
                last = random.choice(LAST_NAMES)
                full_name = f"{first} {last}"
                if full_name not in used_names:
                    used_names.add(full_name)
                    break

            # Assign risk level with weighted distribution
            risk_level = random.choices(RISK_LEVELS, weights=RISK_DISTRIBUTION, k=1)[0]

            # Random initial investment between $5k and $500k
            initial_investment = round(random.uniform(5000, 500000), 2)

            # Get base portfolio for this risk level and add noise
            base_weights = RISK_PORTFOLIOS[risk_level]
            target_weights = add_noise_to_weights(base_weights)

            # Create client
            client = Client(
                advisor_id=advisor.id,
                name=full_name,
                email=f"{first.lower()}.{last.lower()}@example.com",
                risk_level=risk_level,
                initial_investment=initial_investment,
            )
            db.add(client)
            db.flush()  # Get client.id

            # Create portfolio
            portfolio = ClientPortfolio(
                client_id=client.id,
                target_weights=target_weights,
                current_weights=None,  # Will be calculated during batch run
            )
            db.add(portfolio)

        db.commit()

        # Summary
        counts = {}
        for rl in RISK_LEVELS:
            counts[rl] = db.query(Client).filter(
                Client.advisor_id == advisor.id,
                Client.risk_level == rl
            ).count()

        print(f"\n[OK] Seeded 50 clients for advisor '{advisor.name}' (id={advisor.id})")
        print(f"   Conservative: {counts['Conservative']}")
        print(f"   Moderate:     {counts['Moderate']}")
        print(f"   Aggressive:   {counts['Aggressive']}")
        print(f"   Advisor ID:   {advisor.id}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
