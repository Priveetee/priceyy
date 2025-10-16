from sqlalchemy.orm import Session
from sqlalchemy import distinct
from src.models.pricing import Pricing

class DiscoveryService:
    
    @staticmethod
    def get_providers(db: Session) -> list:
        providers = db.query(distinct(Pricing.provider)).all()
        return [p[0] for p in providers]
    
    @staticmethod
    def get_services(db: Session, provider: str) -> list:
        services = db.query(distinct(Pricing.service_name)).filter(
            Pricing.provider == provider
        ).all()
        return [s[0] for s in services]
    
    @staticmethod
    def get_resources(db: Session, provider: str, service_name: str) -> list:
        resources = db.query(distinct(Pricing.resource_type)).filter(
            Pricing.provider == provider,
            Pricing.service_name == service_name
        ).all()
        return [r[0] for r in resources]
    
    @staticmethod
    def get_regions(db: Session, provider: str) -> list:
        regions = db.query(distinct(Pricing.region)).filter(
            Pricing.provider == provider
        ).all()
        return [r[0] for r in regions]
    
    @staticmethod
    def get_pricing_models(db: Session) -> list:
        return ["on-demand", "reserved-1y", "reserved-3y", "spot"]
