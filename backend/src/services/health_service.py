from src.database import SessionLocal
from src.redis_client import get_redis
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

class HealthService:
    @staticmethod
    def check_db() -> tuple[bool, str]:
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            return True, "Database OK"
        except Exception as e:
            return False, f"Database error: {str(e)}"
    
    @staticmethod
    async def check_redis() -> tuple[bool, str]:
        try:
            redis_client = get_redis()
            if redis_client is None:
                return False, "Redis client not initialized"
            await redis_client.ping()
            return True, "Redis OK"
        except Exception as e:
            return False, f"Redis error: {str(e)}"
    
    @staticmethod
    async def check_all() -> dict:
        db_ok, db_msg = HealthService.check_db()
        redis_ok, redis_msg = await HealthService.check_redis()
        
        overall = db_ok and redis_ok
        
        return {
            "status": "ok" if overall else "degraded",
            "database": {"ok": db_ok, "message": db_msg},
            "redis": {"ok": redis_ok, "message": redis_msg}
        }
