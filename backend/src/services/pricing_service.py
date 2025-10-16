from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from src.models.pricing import Pricing, PricingHistory
from src.schemas import PricingCreate, PricingResponse
from src.redis_client import redis_client
import json
from typing import Optional, List
from uuid import UUID

class PricingService:
    
    @staticmethod
    async def get_price_with_validation(
        db: Session,
        provider: str,
        service_name: str,
        resource_type: str,
        region: str,
        pricing_model: str,
        session_id: Optional[str] = None
    ) -> float:
        cache_key = f"pricing:{provider}:{service_name}:{resource_type}:{region}:{pricing_model}"
        
        cached_price = await redis_client.get(cache_key)
        
        db_price = db.query(Pricing).filter(
            and_(
                Pricing.provider == provider,
                Pricing.service_name == service_name,
                Pricing.resource_type == resource_type,
                Pricing.region == region,
                Pricing.pricing_model == pricing_model
            )
        ).first()
        
        if not db_price:
            raise ValueError(f"Price not found for {resource_type} in {region}")
        
        if cached_price:
            cached_value = float(cached_price)
            if abs(cached_value - db_price.hourly_price) > 0.001:
                await redis_client.set(cache_key, db_price.hourly_price, ex=28800)
        else:
            await redis_client.set(cache_key, db_price.hourly_price, ex=28800)
        
        final_price = db_price.hourly_price
        
        if session_id:
            from src.models.estimation import UserPriceOverride
            override = db.query(UserPriceOverride).filter(
                and_(
                    UserPriceOverride.session_id == session_id,
                    UserPriceOverride.pricing_id == db_price.id
                )
            ).first()
            
            if override:
                final_price = override.custom_hourly_price
        
        return final_price
    
    @staticmethod
    def create_price(db: Session, price: PricingCreate) -> Pricing:
        existing = db.query(Pricing).filter(
            and_(
                Pricing.provider == price.provider,
                Pricing.service_name == price.service_name,
                Pricing.resource_type == price.resource_type,
                Pricing.region == price.region,
                Pricing.pricing_model == price.pricing_model
            )
        ).first()
        
        if existing:
            existing.hourly_price = price.hourly_price
            existing.last_updated = func.now()
            db.commit()
            return existing
        
        db_price = Pricing(**price.dict())
        db.add(db_price)
        db.commit()
        db.refresh(db_price)
        return db_price
    
    @staticmethod
    def update_price_if_changed(
        db: Session,
        provider: str,
        service_name: str,
        resource_type: str,
        region: str,
        pricing_model: str,
        new_hourly_price: float
    ) -> bool:
        existing = db.query(Pricing).filter(
            and_(
                Pricing.provider == provider,
                Pricing.service_name == service_name,
                Pricing.resource_type == resource_type,
                Pricing.region == region,
                Pricing.pricing_model == pricing_model
            )
        ).first()
        
        if existing:
            old_price = existing.hourly_price
            if abs(old_price - new_hourly_price) > 0.001:
                existing.hourly_price = new_hourly_price
                existing.last_updated = func.now()
                db.commit()
                
                history = PricingHistory(
                    pricing_id=existing.id,
                    old_hourly_price=old_price,
                    new_hourly_price=new_hourly_price,
                    change_reason='scheduled-refresh'
                )
                db.add(history)
                db.commit()
                return True
            return False
        else:
            new_price = Pricing(
                provider=provider,
                service_name=service_name,
                resource_type=resource_type,
                region=region,
                pricing_model=pricing_model,
                hourly_price=new_hourly_price,
                source='aws-api' if provider == 'aws' else 'azure-api'
            )
            db.add(new_price)
            db.commit()
            return True
    
    @staticmethod
    def get_all_prices(db: Session) -> List[Pricing]:
        return db.query(Pricing).all()
