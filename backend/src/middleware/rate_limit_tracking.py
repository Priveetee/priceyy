import logging
import json
from starlette.middleware.base import BaseHTTPMiddleware
from src.services.rate_limit_monitoring_service import RateLimitMonitoringService

logger = logging.getLogger(__name__)

class RateLimitTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            response = await call_next(request)
            
            user_id = "anonymous"
            if hasattr(request.state, "user_id"):
                user_id = request.state.user_id
            else:
                user_id = request.client.host if request.client else "unknown"
            
            endpoint = request.url.path
            await RateLimitMonitoringService.track_request(
                endpoint=endpoint,
                user_id=user_id,
                status_code=response.status_code
            )
            
            logger.debug(f"Tracked: {endpoint} from {user_id} → {response.status_code}")
            
            return response
        
        except Exception as e:
            logger.error(f"Rate limit tracking error: {str(e)}", exc_info=True)
            return await call_next(request)
