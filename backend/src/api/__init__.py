from fastapi import APIRouter
from .auth import router as auth_router
from .estimations import router as estimations_router
from .pricing import router as pricing_router
from .health import router as health_router
from .discovery import router as discovery_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(estimations_router, prefix="/estimations", tags=["estimations"])
api_router.include_router(pricing_router, prefix="/pricing", tags=["pricing"])
api_router.include_router(discovery_router, prefix="/discovery", tags=["discovery"])
