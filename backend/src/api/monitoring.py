from fastapi import APIRouter, Depends
from src.middleware.monitoring import METRICS
from src.middleware.auth import get_current_user

router = APIRouter()

@router.get("/metrics")
async def get_metrics(user_id: str = Depends(get_current_user)):
    avg_latencies = {}
    for endpoint, latencies in METRICS["latency_by_endpoint"].items():
        if latencies:
            avg_latencies[endpoint] = round(sum(latencies) / len(latencies), 2)
    
    return {
        "requests_total": METRICS["requests_total"],
        "requests_by_endpoint": METRICS["requests_by_endpoint"],
        "average_latency_ms_by_endpoint": avg_latencies,
        "errors": {
            "auth_failures": METRICS["auth_failures"],
            "pricing_errors": METRICS["pricing_errors"],
            "db_errors": METRICS["db_errors"]
        },
        "health": "ok" if METRICS["auth_failures"] < 10 and METRICS["db_errors"] < 5 else "degraded"
    }
