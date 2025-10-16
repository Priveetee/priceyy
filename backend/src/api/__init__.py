from fastapi import APIRouter
from .pricing import router as pricing_router
from .estimations import router as estimations_router
from .health import router as health_router

api_router = APIRouter(prefix="/api")
api_router.include_router(pricing_router, prefix="/pricing", tags=["pricing"])
api_router.include_router(estimations_router, prefix="/estimations", tags=["estimations"])
api_router.include_router(health_router, prefix="/health", tags=["health"])

__all__ = ['api_router']
