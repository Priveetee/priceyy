from fastapi import APIRouter, Depends, Body, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import CalculationRequest, CalculationResponse, ServiceCostCalculation, EstimationCreate, EstimationResponse
from src.services.pricing_service import PricingService
from src.models.estimation import Estimation, EstimationService, UserPriceOverride
from src.exceptions import EstimationNotFoundError
from src.rate_limit import limiter
from src.audit import log_calculation_performed, log_estimation_created, log_price_override, log_export_csv
from typing import List
from uuid import UUID
import csv
from io import StringIO

router = APIRouter()

DISCOUNT_MODELS = {
    "on-demand": 0.0,
    "reserved-1y": 0.40,
    "reserved-3y": 0.60,
    "spot": 0.90
}

@router.post("/calculate", response_model=CalculationResponse)
@limiter.limit("10/minute")
async def calculate_estimation(
    request: Request,
    req: CalculationRequest,
    db: Session = Depends(get_db)
):
    services_breakdown = []
    total_monthly = 0
    total_annual = 0
    
    for service_config in req.services:
        hourly_price = await PricingService.get_price_with_validation(
            db=db,
            provider=req.provider.value,
            service_name=service_config.service,
            resource_type=service_config.resource_type,
            region=service_config.region,
            pricing_model=service_config.pricing_model.value,
            session_id=req.session_id
        )
        
        discount = DISCOUNT_MODELS.get(service_config.pricing_model.value, 0.0)
        final_hourly_price = hourly_price * (1 - discount)
        
        monthly_cost = (
            service_config.quantity * 
            final_hourly_price * 
            service_config.hours_per_month
        )
        annual_cost = monthly_cost * 12
        
        services_breakdown.append(ServiceCostCalculation(
            service=service_config.service,
            resource_type=service_config.resource_type,
            quantity=service_config.quantity,
            region=service_config.region,
            pricing_model=service_config.pricing_model.value,
            base_hourly_price=hourly_price,
            final_hourly_price=final_hourly_price,
            monthly_cost=round(monthly_cost, 2),
            annual_cost=round(annual_cost, 2)
        ))
        
        total_monthly += monthly_cost
        total_annual += annual_cost
    
    log_calculation_performed(req.session_id, req.provider.value, len(req.services))
    
    return CalculationResponse(
        total_monthly_cost=round(total_monthly, 2),
        total_annual_cost=round(total_annual, 2),
        services_breakdown=services_breakdown
    )

@router.post("/save", response_model=EstimationResponse)
@limiter.limit("30/minute")
async def save_estimation(
    request: Request,
    estimation: EstimationCreate,
    db: Session = Depends(get_db)
):
    services_data = estimation.services
    
    db_estimation = Estimation(
        user_id=estimation.user_id,
        provider=estimation.provider.value,
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
    
    log_estimation_created(str(db_estimation.id), estimation.user_id, estimation.provider.value)
    
    return db_estimation

@router.get("/{estimation_id}", response_model=EstimationResponse)
@limiter.limit("50/minute")
async def get_estimation(
    request: Request,
    estimation_id: UUID,
    db: Session = Depends(get_db)
):
    estimation = db.query(Estimation).filter(Estimation.id == estimation_id).first()
    
    if not estimation:
        raise EstimationNotFoundError(str(estimation_id))
    
    return estimation

@router.post("/override-price")
@limiter.limit("20/minute")
async def override_price(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    session_id = data.get('session_id')
    pricing_id = data.get('pricing_id')
    custom_hourly_price = data.get('custom_hourly_price')
    reason = data.get('reason')
    
    override = UserPriceOverride(
        session_id=session_id,
        pricing_id=UUID(pricing_id),
        custom_hourly_price=custom_hourly_price,
        reason=reason
    )
    db.add(override)
    db.commit()
    
    log_price_override(session_id, str(pricing_id), 0, custom_hourly_price)
    
    return {"status": "ok", "message": f"Price overridden to €{custom_hourly_price}"}

@router.get("/{estimation_id}/export-csv")
@limiter.limit("30/minute")
async def export_estimation_csv(
    request: Request,
    estimation_id: UUID,
    db: Session = Depends(get_db)
):
    estimation = db.query(Estimation).filter(Estimation.id == estimation_id).first()
    
    if not estimation:
        raise EstimationNotFoundError(str(estimation_id))
    
    services = db.query(EstimationService).filter(EstimationService.estimation_id == estimation_id).all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["ESTIMATION", estimation.name])
    writer.writerow(["Provider", estimation.provider])
    writer.writerow(["Total Monthly", f"€{estimation.total_monthly_cost}"])
    writer.writerow(["Total Annual", f"€{estimation.total_annual_cost}"])
    writer.writerow([])
    
    writer.writerow(["Service", "Resource", "Region", "Quantity", "Monthly Cost", "Annual Cost"])
    
    for service in services:
        writer.writerow([
            service.service_name,
            service.parameters.get('resource_type'),
            service.region,
            service.quantity,
            f"€{service.monthly_cost}",
            f"€{service.annual_cost}"
        ])
    
    output.seek(0)
    
    log_export_csv(str(estimation_id), estimation.user_id)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment;filename=estimation_{estimation_id}.csv"}
    )
