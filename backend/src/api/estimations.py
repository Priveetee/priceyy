from fastapi import APIRouter, Depends, Body, Request, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from datetime import timedelta, datetime
from src.database import get_db
from src.middleware.auth import get_current_user
from src.schemas import CalculationRequest, CalculationResponse, ServiceCostCalculation, EstimationCreate, EstimationResponse
from src.services.pricing_service import PricingService
from src.services.data_transfer_service import DataTransferService
from src.services.override_service import OverrideService
from src.models.estimation import Estimation, EstimationService, EstimationVersion
from src.models.pricing import Pricing
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

def calculate_reserved_cost(hourly_price: float, upfront_cost: float, quantity: int, hours_per_month: int, commitment_years: int) -> float:
    if upfront_cost and upfront_cost > 0:
        monthly_upfront = (upfront_cost / (commitment_years * 12)) / quantity
        monthly_hourly = hourly_price * hours_per_month
        return monthly_upfront + monthly_hourly
    else:
        return hourly_price * hours_per_month

@router.post("/calculate", response_model=CalculationResponse)
@limiter.limit("10/minute")
async def calculate_estimation(
    request: Request,
    req: CalculationRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    services_breakdown = []
    total_monthly = 0
    total_annual = 0
    
    for service_config in req.services:
        hourly_price = PricingService.get_price_with_validation(
            db=db,
            provider=req.provider.value,
            service_name=service_config.service,
            resource_type=service_config.resource_type,
            region=service_config.region,
            pricing_model=service_config.pricing_model.value,
            session_id=req.session_id
        )
        
        db_price = db.query(Pricing).filter(
            Pricing.provider == req.provider.value,
            Pricing.service_name == service_config.service,
            Pricing.resource_type == service_config.resource_type,
            Pricing.region == service_config.region,
            Pricing.pricing_model == service_config.pricing_model.value
        ).first()
        
        upfront_cost = db_price.upfront_cost if db_price else 0
        
        discount = DISCOUNT_MODELS.get(service_config.pricing_model.value, 0.0)
        final_hourly_price = hourly_price * (1 - discount)
        
        if service_config.pricing_model.value == "reserved-1y":
            monthly_cost = calculate_reserved_cost(
                final_hourly_price,
                upfront_cost,
                service_config.quantity,
                service_config.hours_per_month,
                1
            )
        elif service_config.pricing_model.value == "reserved-3y":
            monthly_cost = calculate_reserved_cost(
                final_hourly_price,
                upfront_cost,
                service_config.quantity,
                service_config.hours_per_month,
                3
            )
        else:
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
    
    total_data_transfer_cost = 0
    if req.data_transfers:
        for transfer in req.data_transfers:
            cost = DataTransferService.calculate_transfer_cost(
                db=db,
                provider=req.provider.value,
                from_region=transfer.from_region,
                to_region=transfer.to_region,
                transfer_type=transfer.transfer_type,
                data_transfer_gb=transfer.data_transfer_gb
            )
            total_data_transfer_cost += cost
    
    total_monthly += total_data_transfer_cost
    total_annual += total_data_transfer_cost * 12
    
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
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    if str(estimation.user_id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
    
    services_data = estimation.services
    
    db_estimation = Estimation(
        user_id=user_id,
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
    
    log_estimation_created(str(db_estimation.id), user_id, estimation.provider.value)
    
    return db_estimation

@router.get("")
@limiter.limit("50/minute")
async def list_estimations(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    total = db.query(Estimation).filter(Estimation.user_id == user_id).count()
    
    estimations = db.query(Estimation).options(
        joinedload(Estimation.services)
    ).filter(
        Estimation.user_id == user_id
    ).order_by(Estimation.created_at.desc()).limit(limit).offset(offset).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": estimations
    }

@router.get("/{estimation_id}", response_model=EstimationResponse)
@limiter.limit("50/minute")
async def get_estimation(
    request: Request,
    estimation_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    estimation = db.query(Estimation).options(
        joinedload(Estimation.services)
    ).filter(
        Estimation.id == estimation_id,
        Estimation.user_id == user_id
    ).first()
    
    if not estimation:
        raise EstimationNotFoundError(str(estimation_id))
    
    return estimation

@router.delete("/{estimation_id}")
@limiter.limit("30/minute")
async def delete_estimation(
    request: Request,
    estimation_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    estimation = db.query(Estimation).filter(
        Estimation.id == estimation_id,
        Estimation.user_id == user_id
    ).first()
    
    if not estimation:
        raise EstimationNotFoundError(str(estimation_id))
    
    db.query(EstimationVersion).filter(
        EstimationVersion.estimation_id == estimation_id
    ).delete()
    
    db.delete(estimation)
    db.commit()
    
    return {"status": "ok", "message": f"Estimation {estimation_id} deleted"}

@router.get("/{estimation_id}/history")
@limiter.limit("50/minute")
async def get_estimation_history(
    request: Request,
    estimation_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    estimation = db.query(Estimation).filter(
        Estimation.id == estimation_id,
        Estimation.user_id == user_id
    ).first()
    
    if not estimation:
        raise EstimationNotFoundError(str(estimation_id))
    
    versions = db.query(EstimationVersion).filter(
        EstimationVersion.estimation_id == estimation_id
    ).order_by(EstimationVersion.version_number.desc()).all()
    
    return {
        "estimation_id": str(estimation_id),
        "current": estimation,
        "versions": versions,
        "total_versions": len(versions)
    }

@router.patch("/{estimation_id}")
@limiter.limit("20/minute")
async def update_estimation(
    request: Request,
    estimation_id: UUID,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    estimation = db.query(Estimation).filter(
        Estimation.id == estimation_id,
        Estimation.user_id == user_id
    ).first()
    
    if not estimation:
        raise EstimationNotFoundError(str(estimation_id))
    
    version_number = db.query(EstimationVersion).filter(
        EstimationVersion.estimation_id == estimation_id
    ).count() + 1
    
    snapshot = {
        "name": estimation.name,
        "provider": estimation.provider,
        "total_monthly_cost": estimation.total_monthly_cost,
        "total_annual_cost": estimation.total_annual_cost,
        "data": estimation.data
    }
    
    version = EstimationVersion(
        estimation_id=estimation_id,
        version_number=version_number,
        changes_description=data.get("changes_description", "Update"),
        snapshot=snapshot
    )
    db.add(version)
    
    if "name" in data:
        estimation.name = data["name"]
    if "total_monthly_cost" in data:
        estimation.total_monthly_cost = data["total_monthly_cost"]
    if "total_annual_cost" in data:
        estimation.total_annual_cost = data["total_annual_cost"]
    if "data" in data:
        estimation.data = data["data"]
    if "notes" in data:
        estimation.notes = data["notes"]
    
    estimation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(estimation)
    
    return {
        "status": "ok",
        "message": f"Estimation updated (version {version_number})",
        "estimation": estimation
    }

@router.post("/override-price")
@limiter.limit("20/minute")
async def override_price(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    session_id = data.get('session_id')
    pricing_id = data.get('pricing_id')
    custom_hourly_price = data.get('custom_hourly_price')
    reason = data.get('reason')
    
    if not all([session_id, pricing_id, custom_hourly_price]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    OverrideService.set_override(session_id, pricing_id, custom_hourly_price, reason)
    log_price_override(session_id, str(pricing_id), 0, custom_hourly_price)
    
    return {
        "status": "ok",
        "message": f"Price overridden to €{custom_hourly_price} (expires in 24h)",
        "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
    }

@router.post("/session/{session_id}/cleanup")
@limiter.limit("10/minute")
async def cleanup_session(
    request: Request,
    session_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    count = OverrideService.cleanup_session(session_id)
    return {
        "status": "ok",
        "message": f"Cleaned up {count} overrides for session {session_id}"
    }

@router.get("/{estimation_id}/export-csv")
@limiter.limit("30/minute")
async def export_estimation_csv(
    request: Request,
    estimation_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    estimation = db.query(Estimation).options(
        joinedload(Estimation.services)
    ).filter(
        Estimation.id == estimation_id,
        Estimation.user_id == user_id
    ).first()
    
    if not estimation:
        raise EstimationNotFoundError(str(estimation_id))
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["ESTIMATION", estimation.name])
    writer.writerow(["Provider", estimation.provider])
    writer.writerow(["Total Monthly", f"€{estimation.total_monthly_cost}"])
    writer.writerow(["Total Annual", f"€{estimation.total_annual_cost}"])
    writer.writerow([])
    
    writer.writerow(["Service", "Resource", "Region", "Quantity", "Monthly Cost", "Annual Cost"])
    
    for service in estimation.services:
        writer.writerow([
            service.service_name,
            service.parameters.get('resource_type'),
            service.region,
            service.quantity,
            f"€{service.monthly_cost}",
            f"€{service.annual_cost}"
        ])
    
    output.seek(0)
    
    log_export_csv(str(estimation_id), user_id)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment;filename=estimation_{estimation_id}.csv"}
    )

@router.get("/{id1}/compare/{id2}")
@limiter.limit("50/minute")
async def compare_estimations(
    request: Request,
    id1: UUID,
    id2: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    from src.services.comparison_service import ComparisonService
    
    est1 = db.query(Estimation).filter(
        Estimation.id == id1,
        Estimation.user_id == user_id
    ).first()
    
    est2 = db.query(Estimation).filter(
        Estimation.id == id2,
        Estimation.user_id == user_id
    ).first()
    
    if not est1 or not est2:
        raise EstimationNotFoundError(f"One or both estimations not found")
    
    comparison = ComparisonService.compare_estimations(est1, est2)
    
    return {
        "estimation_1": {
            "id": str(est1.id),
            "name": est1.name,
            "created_at": est1.created_at
        },
        "estimation_2": {
            "id": str(est2.id),
            "name": est2.name,
            "created_at": est2.created_at
        },
        "comparison": comparison
    }
