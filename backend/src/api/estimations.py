from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import CalculationRequest, CalculationResponse, ServiceCostCalculation, EstimationCreate, EstimationResponse
from src.services.pricing_service import PricingService
from src.models.estimation import Estimation, EstimationService
from typing import List
from uuid import UUID
import uuid

router = APIRouter()

DISCOUNT_MODELS = {
    "on-demand": 0.0,
    "reserved-1y": 0.40,
    "reserved-3y": 0.60,
    "spot": 0.90
}

@router.post("/calculate", response_model=CalculationResponse)
async def calculate_estimation(
    request: CalculationRequest,
    db: Session = Depends(get_db)
):
    services_breakdown = []
    total_monthly = 0
    total_annual = 0
    
    for service_config in request.services:
        try:
            hourly_price = await PricingService.get_price_with_validation(
                db=db,
                provider=request.provider,
                service_name=service_config['service'],
                resource_type=service_config['resource_type'],
                region=service_config['region'],
                pricing_model=service_config['pricing_model'],
                session_id=request.session_id
            )
            
            discount = DISCOUNT_MODELS.get(service_config['pricing_model'], 0.0)
            final_hourly_price = hourly_price * (1 - discount)
            
            hours_per_month = service_config.get('hours_per_month', 730)
            monthly_cost = (
                service_config['quantity'] * 
                final_hourly_price * 
                hours_per_month
            )
            annual_cost = monthly_cost * 12
            
            services_breakdown.append(ServiceCostCalculation(
                service=service_config['service'],
                resource_type=service_config['resource_type'],
                quantity=service_config['quantity'],
                region=service_config['region'],
                pricing_model=service_config['pricing_model'],
                base_hourly_price=hourly_price,
                final_hourly_price=final_hourly_price,
                monthly_cost=round(monthly_cost, 2),
                annual_cost=round(annual_cost, 2)
            ))
            
            total_monthly += monthly_cost
            total_annual += annual_cost
            
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    
    return CalculationResponse(
        total_monthly_cost=round(total_monthly, 2),
        total_annual_cost=round(total_annual, 2),
        services_breakdown=services_breakdown
    )

@router.post("/save", response_model=EstimationResponse)
async def save_estimation(
    estimation: EstimationCreate,
    db: Session = Depends(get_db)
):
    services_data = estimation.services
    
    db_estimation = Estimation(
        user_id=estimation.user_id,
        provider=estimation.provider,
        name=estimation.name,
        status='saved',
        total_monthly_cost=estimation.data.get('total_monthly_cost'),
        total_annual_cost=estimation.data.get('total_annual_cost'),
        data=estimation.data,
        notes=estimation.notes
    )
    
    db.add(db_estimation)
    db.flush()
    
    for service in services_data:
        db_service = EstimationService(
            estimation_id=db_estimation.id,
            service_name=service.service_name,
            region=service.region,
            quantity=service.quantity,
            monthly_cost=service.monthly_cost,
            annual_cost=service.annual_cost,
            parameters=service.parameters
        )
        db.add(db_service)
    
    db.commit()
    db.refresh(db_estimation)
    return db_estimation

@router.get("/{estimation_id}", response_model=EstimationResponse)
async def get_estimation(
    estimation_id: UUID,
    db: Session = Depends(get_db)
):
    estimation = db.query(Estimation).filter(Estimation.id == estimation_id).first()
    
    if not estimation:
        raise HTTPException(status_code=404, detail="Estimation not found")
    
    return estimation
