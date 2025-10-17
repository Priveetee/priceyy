import logging
import json
from datetime import datetime
from typing import Dict
from src.redis_client import get_redis

logger = logging.getLogger(__name__)

class RateLimitMonitoringService:
    LIMITS = {
        "/api/estimations/calculate": 5000,
        "/api/estimations/save": 2000,
        "/api/estimations": 1500,
        "/api/estimations/{id}": 1000,
        "/api/estimations/{id}/history": 1000,
        "/api/estimations/{id}/export-csv": 1000,
        "/api/auth/register": 500,
        "/api/auth/login": 500,
    }
    
    ALERT_THRESHOLD = 0.80
    
    @staticmethod
    async def track_request(endpoint: str, user_id: str, status_code: int):
        redis = get_redis()
        if not redis:
            return
        
        try:
            timestamp = datetime.utcnow().isoformat()
            
            endpoint_key = f"ratelimit:endpoint:{endpoint}"
            await redis.incr(endpoint_key)
            await redis.expire(endpoint_key, 60)
            
            user_key = f"ratelimit:user:{user_id}:{endpoint}"
            await redis.incr(user_key)
            await redis.expire(user_key, 60)
            
            if status_code == 429:
                error_key = f"ratelimit:errors:{endpoint}"
                await redis.incr(error_key)
                await redis.expire(error_key, 60)
            
            await RateLimitMonitoringService._check_threshold(endpoint, user_id)
            
        except Exception as e:
            logger.error(f"Failed to track rate limit: {str(e)}")
    
    @staticmethod
    async def _check_threshold(endpoint: str, user_id: str):
        redis = get_redis()
        if not redis:
            return
        
        try:
            limit = RateLimitMonitoringService.LIMITS.get(endpoint)
            if not limit:
                return
            
            endpoint_key = f"ratelimit:endpoint:{endpoint}"
            endpoint_count = await redis.get(endpoint_key)
            
            if endpoint_count:
                count = int(endpoint_count)
                usage_percent = (count / (limit / 60)) * 100
                
                if usage_percent >= (RateLimitMonitoringService.ALERT_THRESHOLD * 100):
                    await RateLimitMonitoringService._send_alert(
                        endpoint=endpoint,
                        usage_percent=usage_percent,
                        current_count=count,
                        limit=limit / 60,
                        alert_type="endpoint"
                    )
            
            user_key = f"ratelimit:user:{user_id}:{endpoint}"
            user_count = await redis.get(user_key)
            
            if user_count:
                count = int(user_count)
                user_limit = (limit / 60) / 100
                usage_percent = (count / user_limit) * 100
                
                if usage_percent >= (RateLimitMonitoringService.ALERT_THRESHOLD * 100):
                    await RateLimitMonitoringService._send_alert(
                        endpoint=endpoint,
                        user_id=user_id,
                        usage_percent=usage_percent,
                        current_count=count,
                        limit=user_limit,
                        alert_type="user"
                    )
        
        except Exception as e:
            logger.error(f"Failed to check threshold: {str(e)}")
    
    @staticmethod
    async def _send_alert(endpoint: str, usage_percent: float, current_count: int, 
                    limit: float, alert_type: str, user_id: str = None):
        alert_data = {
            "event": "rate_limit_threshold_exceeded",
            "endpoint": endpoint,
            "alert_type": alert_type,
            "usage_percent": round(usage_percent, 2),
            "current_count": current_count,
            "limit_per_minute": round(limit, 2),
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.warning(json.dumps(alert_data))
        
        try:
            redis = get_redis()
            if redis:
                alert_key = f"ratelimit:alerts:{endpoint}"
                await redis.lpush(alert_key, json.dumps(alert_data))
                await redis.ltrim(alert_key, 0, 99)
                await redis.expire(alert_key, 3600)
        except Exception as e:
            logger.error(f"Failed to store alert: {str(e)}")
    
    @staticmethod
    async def get_stats(endpoint: str = None) -> Dict:
        redis = get_redis()
        if not redis:
            return {}
        
        stats = {}
        
        try:
            if endpoint:
                endpoints = [endpoint]
            else:
                endpoints = list(RateLimitMonitoringService.LIMITS.keys())
            
            for ep in endpoints:
                endpoint_key = f"ratelimit:endpoint:{ep}"
                error_key = f"ratelimit:errors:{ep}"
                
                count = await redis.get(endpoint_key)
                errors = await redis.get(error_key)
                limit = RateLimitMonitoringService.LIMITS.get(ep, 1000)
                
                stats[ep] = {
                    "requests_this_minute": int(count) if count else 0,
                    "errors_this_minute": int(errors) if errors else 0,
                    "limit_per_minute": limit,
                    "usage_percent": round(((int(count) if count else 0) / limit) * 100, 2)
                }
        
        except Exception as e:
            logger.error(f"Failed to get stats: {str(e)}")
        
        return stats
    
    @staticmethod
    async def get_user_abuse_report(time_window: int = 60) -> Dict:
        redis = get_redis()
        if not redis:
            return {}
        
        abuse_patterns = {}
        
        try:
            cursor = 0
            while True:
                cursor, keys = await redis.scan(
                    cursor,
                    match="ratelimit:user:*",
                    count=100
                )
                
                for key in keys:
                    count = await redis.get(key)
                    if count and int(count) > 500:
                        parts = key.decode().split(":")
                        user_id = parts[2]
                        endpoint = ":".join(parts[3:])
                        
                        if user_id not in abuse_patterns:
                            abuse_patterns[user_id] = []
                        
                        abuse_patterns[user_id].append({
                            "endpoint": endpoint,
                            "requests": int(count),
                            "timestamp": datetime.utcnow().isoformat()
                        })
                
                if cursor == 0:
                    break
        
        except Exception as e:
            logger.error(f"Failed to get abuse report: {str(e)}")
        
        return abuse_patterns
