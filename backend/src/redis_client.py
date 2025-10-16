import redis.asyncio as redis
from src.config import settings

redis_client = None

async def init_redis():
    global redis_client
    try:
        redis_client = await redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()
        print("Redis connected successfully")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}")
        redis_client = None

async def close_redis():
    if redis_client:
        await redis_client.close()

async def get_redis():
    return redis_client
