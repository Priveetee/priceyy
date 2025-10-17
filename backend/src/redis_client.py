import redis.asyncio as redis
from src.config import settings
import logging
import json

logger = logging.getLogger(__name__)

redis_client = None
redis_available = False

async def init_redis():
    global redis_client, redis_available
    try:
        redis_client = await redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()
        redis_available = True
        logger.info(json.dumps({"event": "redis.connected"}))
    except Exception as e:
        logger.warning(json.dumps({
            "event": "redis.connection_failed",
            "error": str(e),
            "impact": "App will work without caching (slower)"
        }))
        redis_client = None
        redis_available = False

async def close_redis():
    global redis_client
    if redis_client:
        try:
            await redis_client.close()
        except Exception as e:
            logger.warning(json.dumps({"event": "redis.close_error", "error": str(e)}))
        redis_client = None

def is_redis_available() -> bool:
    return redis_available

def get_redis():
    return redis_client
