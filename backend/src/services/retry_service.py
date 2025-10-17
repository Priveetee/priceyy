import asyncio
import logging
import json
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 5, timeout: int = 60):
        self.name = name
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = "closed"
    
    def record_success(self):
        self.failures = 0
        self.state = "closed"
    
    def record_failure(self):
        self.failures += 1
        self.last_failure_time = datetime.utcnow()
        
        if self.failures >= self.failure_threshold:
            self.state = "open"
            logger.critical(json.dumps({
                "event": "circuit_breaker.open",
                "breaker": self.name,
                "failures": self.failures
            }))
    
    def is_open(self) -> bool:
        if self.state == "open":
            if datetime.utcnow() - self.last_failure_time > timedelta(seconds=self.timeout):
                self.state = "half-open"
                self.failures = 0
                return False
            return True
        return False
    
    def call(self, func, *args, **kwargs):
        if self.is_open():
            raise Exception(f"Circuit breaker {self.name} is open")
        
        try:
            result = func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure()
            raise

async def retry_with_backoff(func, max_retries: int = 3, backoff: float = 1.0):
    for attempt in range(max_retries):
        try:
            return await func() if asyncio.iscoroutinefunction(func) else func()
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(json.dumps({
                    "event": "retry.exhausted",
                    "error": str(e),
                    "attempts": max_retries
                }))
                raise
            
            wait_time = backoff * (2 ** attempt)
            logger.warning(json.dumps({
                "event": "retry.attempt",
                "attempt": attempt + 1,
                "max": max_retries,
                "wait_seconds": wait_time,
                "error": str(e)
            }))
            await asyncio.sleep(wait_time)
