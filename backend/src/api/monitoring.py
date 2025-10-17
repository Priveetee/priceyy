import logging
import json
from fastapi import APIRouter, Depends, HTTPException
from src.middleware.auth import get_current_user
from src.services.rate_limit_monitoring_service import RateLimitMonitoringService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/rate-limit-stats")
async def get_rate_limit_stats(endpoint: str = None, current_user = Depends(get_current_user)):
    try:
        stats = await RateLimitMonitoringService.get_stats(endpoint=endpoint)
        return {"stats": stats}
    except Exception as e:
        logger.error(f"Failed to get rate limit stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve stats")

@router.get("/abuse-report")
async def get_abuse_report(current_user = Depends(get_current_user)):
    try:
        patterns = await RateLimitMonitoringService.get_user_abuse_report()
        return {"abuse_patterns": patterns}
    except Exception as e:
        logger.error(f"Failed to get abuse report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve report")
