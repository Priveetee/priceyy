from src.redis_client import redis_client
from uuid import UUID
import json

class OverrideService:
    OVERRIDE_TTL = 86400

    @staticmethod
    def set_override(session_id: str, pricing_id: str, custom_price: float, reason: str = None):
        if not redis_client:
            return False
        
        key = f"override:{session_id}:{pricing_id}"
        value = {
            "price": custom_price,
            "reason": reason
        }
        
        redis_client.setex(key, OverrideService.OVERRIDE_TTL, json.dumps(value))
        return True

    @staticmethod
    def get_override(session_id: str, pricing_id: str) -> float:
        if not redis_client:
            return None
        
        key = f"override:{session_id}:{pricing_id}"
        data = redis_client.get(key)
        
        if data:
            return float(json.loads(data)["price"])
        return None

    @staticmethod
    def delete_override(session_id: str, pricing_id: str):
        if not redis_client:
            return False
        
        key = f"override:{session_id}:{pricing_id}"
        redis_client.delete(key)
        return True

    @staticmethod
    def cleanup_session(session_id: str):
        if not redis_client:
            return 0
        
        pattern = f"override:{session_id}:*"
        keys = redis_client.keys(pattern)
        if keys:
            return redis_client.delete(*keys)
        return 0
