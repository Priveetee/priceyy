from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.services.discovery_service import DiscoveryService
from src.middleware.auth import get_current_user
from src.rate_limit import limiter
from fastapi import Request

router = APIRouter()

@router.get("/providers")
@limiter.limit("100/minute")
async def get_providers(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    providers = DiscoveryService.get_providers(db)
    return {"providers": providers}

@router.get("/services")
@limiter.limit("100/minute")
async def get_services(
    request: Request,
    provider: str = Query(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    services = DiscoveryService.get_services(db, provider)
    return {"services": services}

@router.get("/resources")
@limiter.limit("100/minute")
async def get_resources(
    request: Request,
    provider: str = Query(...),
    service: str = Query(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    resources = DiscoveryService.get_resources(db, provider, service)
    return {"resources": resources}

@router.get("/regions")
@limiter.limit("100/minute")
async def get_regions(
    request: Request,
    provider: str = Query(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    regions = DiscoveryService.get_regions(db, provider)
    return {"regions": regions}

@router.get("/pricing-models")
@limiter.limit("100/minute")
async def get_pricing_models(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    models = DiscoveryService.get_pricing_models(db)
    return {"pricing_models": models}
