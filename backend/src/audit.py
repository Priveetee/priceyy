import logging
from datetime import datetime
from typing import Any, Dict, Optional

audit_logger = logging.getLogger("audit")

def log_estimation_created(estimation_id: str, user_id: Optional[str], provider: str):
    audit_logger.info(
        f"ESTIMATION_CREATED|{estimation_id}|{user_id}|{provider}|{datetime.utcnow().isoformat()}"
    )

def log_calculation_performed(user_id: Optional[str], provider: str, service_count: int):
    audit_logger.info(
        f"CALCULATION_PERFORMED|{user_id}|{provider}|{service_count}|{datetime.utcnow().isoformat()}"
    )

def log_price_override(session_id: str, pricing_id: str, old_price: float, new_price: float):
    audit_logger.info(
        f"PRICE_OVERRIDE|{session_id}|{pricing_id}|{old_price}|{new_price}|{datetime.utcnow().isoformat()}"
    )

def log_export_csv(estimation_id: str, user_id: Optional[str]):
    audit_logger.info(
        f"EXPORT_CSV|{estimation_id}|{user_id}|{datetime.utcnow().isoformat()}"
    )

def log_pricing_refresh(provider: str, service: str, count: int):
    audit_logger.info(
        f"PRICING_REFRESH|{provider}|{service}|{count}|{datetime.utcnow().isoformat()}"
    )
