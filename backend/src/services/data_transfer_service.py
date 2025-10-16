from sqlalchemy.orm import Session
from sqlalchemy import and_
from src.models.pricing import DataTransferPricing
from typing import Optional

class DataTransferService:
    
    @staticmethod
    def get_transfer_cost(
        db: Session,
        provider: str,
        from_region: str,
        to_region: str,
        transfer_type: str = "internet-out"
    ) -> Optional[float]:
        """
        Récupère le prix de data transfer.
        
        transfer_type:
        - "internet-out": Sortie Internet (le plus cher)
        - "cross-region": Entre régions (moins cher)
        - "cross-az": Entre AZs même région (gratuit généralement)
        """
        
        price = db.query(DataTransferPricing).filter(
            and_(
                DataTransferPricing.provider == provider,
                DataTransferPricing.from_region == from_region,
                DataTransferPricing.to_region == to_region,
                DataTransferPricing.transfer_type == transfer_type
            )
        ).first()
        
        return price.price_per_gb if price else None
    
    @staticmethod
    def calculate_transfer_cost(
        db: Session,
        provider: str,
        from_region: str,
        to_region: str,
        transfer_type: str,
        data_transfer_gb: float
    ) -> float:
        """Calcule coût total = price_per_gb * GB"""
        
        price_per_gb = DataTransferService.get_transfer_cost(
            db, provider, from_region, to_region, transfer_type
        )
        
        if not price_per_gb:
            return 0.0
        
        return price_per_gb * data_transfer_gb
