from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from src.models.pricing import Pricing
from src.schemas import PricingCreate
from src.redis_client import redis_client
from src.services.override_service import OverrideService
from src.exceptions import PriceNotFoundError
import json
from typing import Optional, Tuple

class PricingService:

    @staticmethod
    def get_price_with_full_validation(
        db: Session,
        provider: str,
        service_name: str,
        resource_type: str,
        region: str,
        pricing_model: str,
        session_id: Optional[str] = None
    ) -> Tuple[float, Pricing]:
        cache_key = f"pricing:{provider}:{service_name}:{resource_type}:{region}:{pricing_model}"

        cached_price = None
        if redis_client:
            try:
                cached_price = redis_client.get(cache_key)
            except Exception:
                cached_price = None

        db_price_obj = db.query(Pricing).filter(
            and_(
                Pricing.provider == provider,
                Pricing.service_name == service_name,
                Pricing.resource_type == resource_type,
                Pricing.region == region,
                Pricing.pricing_model == pricing_model
            )
        ).first()

        if db_price_obj:
            hourly_price = db_price_obj.hourly_price
        else:
            from src.services.pricing_fallback_service import PricingFallbackService
            hourly_price, db_price_obj = PricingFallbackService.get_price_or_fallback(
                db, provider, service_name, resource_type, region, pricing_model
            )

        if cached_price and redis_client:
            try:
                cached_value = float(cached_price)
                if abs(cached_value - hourly_price) > 0.001:
                    redis_client.setex(cache_key, 28800, hourly_price)
            except Exception:
                pass
        elif redis_client:
            try:
                redis_client.setex(cache_key, 28800, hourly_price)
            except Exception:
                pass

        final_price = hourly_price

        if session_id and db_price_obj:
            override_price = OverrideService.get_override(session_id, str(db_price_obj.id))
            if override_price is not None:
                final_price = override_price

        return final_price, db_price_obj

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
    def update_price_if_changed(db: Session, provider: str, service_name: str, 
                                resource_type: str, region: str, pricing_model: str, 
                                new_hourly_price: float):
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
            if abs(existing.hourly_price - new_hourly_price) > 0.001:
                existing.hourly_price = new_hourly_price
                existing.last_updated = func.now()
                db.commit()
                
                cache_key = f"pricing:{provider}:{service_name}:{resource_type}:{region}:{pricing_model}"
                if redis_client:
                    try:
                        redis_client.delete(cache_key)
                    except Exception:
                        pass
        else:
            new_price = Pricing(
                provider=provider,
                service_name=service_name,
                resource_type=resource_type,
                region=region,
                pricing_model=pricing_model,
                hourly_price=new_hourly_price
            )
            db.add(new_price)
            db.commit()
