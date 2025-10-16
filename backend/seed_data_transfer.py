import asyncio
from src.database import SessionLocal
from src.models.pricing import DataTransferPricing

def seed_data_transfer():
    """Insère les prix de data transfer AWS typiques"""
    db = SessionLocal()
    
    transfers = [
        ("aws", "eu-west-1", "internet", "internet-out", 0.085),
        ("aws", "eu-west-1", "us-east-1", "cross-region", 0.02),
        ("aws", "eu-west-1", "eu-west-1", "cross-az", 0.0),
        ("aws", "us-east-1", "internet", "internet-out", 0.085),
        ("aws", "ap-southeast-1", "internet", "internet-out", 0.085),
    ]
    
    for provider, region, to_region, transfer_type, price in transfers:
        existing = db.query(DataTransferPricing).filter(
            DataTransferPricing.provider == provider,
            DataTransferPricing.from_region == region,
            DataTransferPricing.to_region == to_region,
            DataTransferPricing.transfer_type == transfer_type
        ).first()
        
        if not existing:
            dt = DataTransferPricing(
                provider=provider,
                from_region=region,
                to_region=to_region,
                transfer_type=transfer_type,
                price_per_gb=price,
                source="aws-api"
            )
            db.add(dt)
    
    db.commit()
    print("Data transfer pricing seeded!")

if __name__ == "__main__":
    seed_data_transfer()
