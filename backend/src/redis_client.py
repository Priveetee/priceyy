import redis
from src.config import settings

redis_client = None

def init_redis():
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        redis_client.ping()
        print("Redis connected successfully")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}")
        redis_client = None

def close_redis():
    if redis_client:
        redis_client.close()

def get_redis():
    return redis_client
