import httpx
import logging
import json
from src.services.retry_service import CircuitBreaker, retry_with_backoff

logger = logging.getLogger(__name__)

aws_breaker = CircuitBreaker("aws-pricing-api", failure_threshold=5, timeout=60)

class AWSPricingService:
    @staticmethod
    async def fetch_ec2_prices(instance_type: str, region: str):
        async def fetch():
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"https://pricing.aws.amazon.com/pricing/v2?service=AmazonEC2&instanceType={instance_type}&region={region}"
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        
        try:
            return await retry_with_backoff(fetch, max_retries=3, backoff=1.0)
        except Exception as e:
            logger.error(json.dumps({
                "event": "aws.pricing.fetch_failed",
                "service": "EC2",
                "instance_type": instance_type,
                "region": region,
                "error": str(e)
            }))
            aws_breaker.record_failure()
            return []
    
    @staticmethod
    async def fetch_rds_prices(db_instance_type: str, region: str):
        async def fetch():
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"https://pricing.aws.amazon.com/pricing/v2?service=AmazonRDS&dbInstanceType={db_instance_type}&region={region}"
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        
        try:
            return await retry_with_backoff(fetch, max_retries=3, backoff=1.0)
        except Exception as e:
            logger.error(json.dumps({
                "event": "aws.pricing.fetch_failed",
                "service": "RDS",
                "instance_type": db_instance_type,
                "region": region,
                "error": str(e)
            }))
            aws_breaker.record_failure()
            return []
