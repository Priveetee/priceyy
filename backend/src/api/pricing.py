from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.pricing import Pricing
from src.services.pricing_service import PricingService
from src.schemas import PricingResponse, PricingCreate
from typing import List

router = APIRouter()

@router.get("/", response_model=List[PricingResponse])
async def list_prices(
    provider: str = None,
    service_name: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Pricing)
    
    if provider:
        query = query.filter(Pricing.provider == provider)
    if service_name:
        query = query.filter(Pricing.service_name == service_name)
    
    return query.all()

@router.post("/", response_model=PricingResponse)
async def create_price(
    price: PricingCreate,
    db: Session = Depends(get_db)
):
    return PricingService.create_price(db, price)
