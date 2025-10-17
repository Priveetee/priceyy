from fastapi import Request
import time
import uuid
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

METRICS = {
    "requests_total": 0,
    "requests_by_endpoint": {},
    "latency_by_endpoint": {},
    "auth_failures": 0,
    "pricing_errors": 0,
    "db_errors": 0
}

async def monitoring_middleware(request: Request, call_next):
    correlation_id = str(uuid.uuid4())
    request.state.correlation_id = correlation_id
    
    start_time = time.time()
    
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        
        endpoint = request.url.path
        METRICS["requests_total"] += 1
        
        if endpoint not in METRICS["requests_by_endpoint"]:
            METRICS["requests_by_endpoint"][endpoint] = 0
            METRICS["latency_by_endpoint"][endpoint] = []
        
        METRICS["requests_by_endpoint"][endpoint] += 1
        METRICS["latency_by_endpoint"][endpoint].append(duration_ms)
        
        log_data = {
            "event": "request.completed",
            "correlation_id": correlation_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2)
        }
        
        if duration_ms > 1000:
            logger.warning(json.dumps({**log_data, "alert": "slow_request"}))
        else:
            logger.info(json.dumps(log_data))
        
        response.headers["X-Correlation-ID"] = correlation_id
        return response
    
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        
        if "auth" in str(e).lower():
            METRICS["auth_failures"] += 1
        if "pricing" in str(e).lower():
            METRICS["pricing_errors"] += 1
        if "database" in str(e).lower() or "db" in str(e).lower():
            METRICS["db_errors"] += 1
        
        logger.error(json.dumps({
            "event": "request.error",
            "correlation_id": correlation_id,
            "method": request.method,
            "path": request.url.path,
            "error": str(e),
            "duration_ms": round(duration_ms, 2)
        }))
        raise
