import httpx
from typing import List, Dict

class AzurePricingService:
    
    BASE_URL = 'https://prices.azure.com/api/retail/prices'
    
    async def fetch_vm_prices(self, vm_type: str, region: str) -> List[Dict]:
        try:
            filter_query = f"productName eq 'Virtual Machines' and skuName eq '{vm_type}' and location eq '{region}' and priceType eq 'Consumption'"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.BASE_URL,
                    params={'$filter': filter_query}
                )
                response.raise_for_status()
                data = response.json()
                
                prices = []
                for item in data.get('Items', []):
                    prices.append({
                        'service': 'VirtualMachines',
                        'resource_type': vm_type,
                        'region': region,
                        'pricing_model': 'on-demand',
                        'hourly_price': float(item['retailPrice'])
                    })
                
                return prices
        except Exception as e:
            raise Exception(f"Error fetching Azure pricing: {str(e)}")
    
    async def fetch_sql_prices(self, database_type: str, region: str) -> List[Dict]:
        try:
            filter_query = f"productName eq 'SQL Database' and skuName eq '{database_type}' and location eq '{region}' and priceType eq 'Consumption'"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.BASE_URL,
                    params={'$filter': filter_query}
                )
                response.raise_for_status()
                data = response.json()
                
                prices = []
                for item in data.get('Items', []):
                    prices.append({
                        'service': 'SQLDatabase',
                        'resource_type': database_type,
                        'region': region,
                        'pricing_model': 'on-demand',
                        'hourly_price': float(item['retailPrice'])
                    })
                
                return prices
        except Exception as e:
            raise Exception(f"Error fetching Azure SQL pricing: {str(e)}")
