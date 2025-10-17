import redis.asyncio as redis
from src.config import settings
import logging

logger = logging.getLogger(__name__)

redis_client = None

async def init_redis():
    global redis_client
    try:
        redis_client = await redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info('{"event": "redis.connected"}')
    except Exception as e:
        logger.error(f'{{"event": "redis.error", "error": "{str(e)}"}}')
        redis_client = None

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None

def get_redis():
    return redis_client
