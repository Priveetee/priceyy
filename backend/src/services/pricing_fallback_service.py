from sqlalchemy.orm import Session
from src.models.pricing import Pricing
import logging

logger = logging.getLogger("fallback")

class PricingFallbackService:
    
    @staticmethod
    def get_price_or_fallback(
        db: Session,
        provider: str,
        service_name: str,
        resource_type: str,
        region: str,
        pricing_model: str
    ) -> tuple[float, bool]:
        """
        Récupère le prix, sinon utilise fallback conservative.
        
        Returns: (price, is_fallback)
        """
        
        price = db.query(Pricing).filter(
            Pricing.provider == provider,
            Pricing.service_name == service_name,
            Pricing.resource_type == resource_type,
            Pricing.region == region,
            Pricing.pricing_model == pricing_model
        ).first()
        
        if price:
            return price.hourly_price, False
        
        logger.warning(
            f"FALLBACK: Price not found for {provider}/{service_name}/{resource_type}/{region}/{pricing_model}"
        )
        
        fallback_price = PricingFallbackService._estimate_fallback_price(
            db, provider, service_name, resource_type, region, pricing_model
        )
        
        return fallback_price, True
    
    @staticmethod
    def _estimate_fallback_price(
        db: Session,
        provider: str,
        service_name: str,
        resource_type: str,
        region: str,
        pricing_model: str
    ) -> float:
        """
        Estime un prix conservatif basé sur:
        1. Même service, autre région
        2. Même pricing model
        3. Ajoute 20% de buffer
        """
        
        similar_price = db.query(Pricing).filter(
            Pricing.provider == provider,
            Pricing.service_name == service_name,
            Pricing.resource_type == resource_type,
            Pricing.pricing_model == pricing_model
        ).first()
        
        if similar_price:
            base_price = similar_price.hourly_price * 1.20
            logger.info(f"FALLBACK: Using {similar_price.region} price with +20% = €{base_price}")
            return base_price
        
        default_prices = {
            ("aws", "EC2", "on-demand"): 0.15,
            ("aws", "EC2", "reserved-3y"): 0.06,
            ("azure", "VirtualMachines", "on-demand"): 0.50,
        }
        
        key = (provider, service_name, pricing_model)
        default_price = default_prices.get(key, 1.0)
        
        logger.warning(f"FALLBACK: Using default price €{default_price}")
        return default_price
