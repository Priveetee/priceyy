import httpx
import logging
import json
from src.services.retry_service import CircuitBreaker, retry_with_backoff

logger = logging.getLogger(__name__)

azure_breaker = CircuitBreaker("azure-pricing-api", failure_threshold=5, timeout=60)

class AzurePricingService:
    @staticmethod
    async def fetch_vm_prices(vm_type: str, region: str):
        async def fetch():
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"https://prices.azure.com/api/v1/retail/Catalog/search?$filter=serviceName eq 'Virtual Machines' and skuName eq '{vm_type}' and location eq '{region}'"
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        
        try:
            return await retry_with_backoff(fetch, max_retries=3, backoff=1.0)
        except Exception as e:
            logger.error(json.dumps({
                "event": "azure.pricing.fetch_failed",
                "service": "VirtualMachines",
                "vm_type": vm_type,
                "region": region,
                "error": str(e)
            }))
            azure_breaker.record_failure()
            return []
    
    @staticmethod
    async def fetch_database_prices(db_type: str, region: str):
        async def fetch():
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"https://prices.azure.com/api/v1/retail/Catalog/search?$filter=serviceName eq 'Azure Database for PostgreSQL' and skuName eq '{db_type}' and location eq '{region}'"
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        
        try:
            return await retry_with_backoff(fetch, max_retries=3, backoff=1.0)
        except Exception as e:
            logger.error(json.dumps({
                "event": "azure.pricing.fetch_failed",
                "service": "Database",
                "db_type": db_type,
                "region": region,
                "error": str(e)
            }))
            azure_breaker.record_failure()
            return []
