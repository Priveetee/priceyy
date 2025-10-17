import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class AlertingService:
    CRITICAL_THRESHOLDS = {
        "auth_failures": 10,
        "pricing_errors": 5,
        "db_errors": 3,
        "latency_ms": 5000
    }
    
    @staticmethod
    def check_health():
        from src.middleware.monitoring import METRICS
        
        alerts = []
        
        if METRICS["auth_failures"] >= AlertingService.CRITICAL_THRESHOLDS["auth_failures"]:
            alerts.append("CRITICAL: Auth system degraded - too many failures")
            logger.critical(json.dumps({
                "event": "alert.auth_system",
                "failures": METRICS["auth_failures"],
                "threshold": AlertingService.CRITICAL_THRESHOLDS["auth_failures"]
            }))
        
        if METRICS["pricing_errors"] >= AlertingService.CRITICAL_THRESHOLDS["pricing_errors"]:
            alerts.append("CRITICAL: Pricing service errors detected")
            logger.critical(json.dumps({
                "event": "alert.pricing_service",
                "errors": METRICS["pricing_errors"],
                "threshold": AlertingService.CRITICAL_THRESHOLDS["pricing_errors"]
            }))
        
        if METRICS["db_errors"] >= AlertingService.CRITICAL_THRESHOLDS["db_errors"]:
            alerts.append("CRITICAL: Database connection issues")
            logger.critical(json.dumps({
                "event": "alert.database",
                "errors": METRICS["db_errors"],
                "threshold": AlertingService.CRITICAL_THRESHOLDS["db_errors"]
            }))
        
        return alerts
    
    @staticmethod
    def log_pricing_error(error: str, provider: str):
        logger.error(json.dumps({
            "event": "pricing.fetch_error",
            "provider": provider,
            "error": str(error),
            "timestamp": datetime.utcnow().isoformat()
        }))
    
    @staticmethod
    def log_auth_error(error_type: str, detail: str):
        logger.warning(json.dumps({
            "event": "auth.error",
            "error_type": error_type,
            "detail": detail,
            "timestamp": datetime.utcnow().isoformat()
        }))
    
    @staticmethod
    def log_critical_error(component: str, error: str):
        logger.critical(json.dumps({
            "event": "critical.error",
            "component": component,
            "error": str(error),
            "timestamp": datetime.utcnow().isoformat()
        }))
