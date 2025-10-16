import httpx
from typing import List, Dict

class AzurePricingService:
    
    BASE_URL = 'https://prices.azure.com/api/retail/prices'
    
    async def fetch_vm_prices(self, vm_type: str, region: str) -> List[Dict]:
        try:
            filter_query = f"serviceName eq 'Virtual Machines' and armSkuName eq '{vm_type}' and armRegionName eq '{region}' and priceType eq 'Consumption'"
            
            async with httpx.AsyncClient() as client:
                prices = []
                url = self.BASE_URL
                params = {'$filter': filter_query}
                
                while url:
                    response = await client.get(url, params=params)
                    response.raise_for_status()
                    data = response.json()
                    
                    print(f"Azure VM query: {filter_query}")
                    print(f"Azure response items: {len(data.get('Items', []))}")
                    
                    for item in data.get('Items', []):
                        prices.append({
                            'service': 'VirtualMachines',
                            'resource_type': vm_type,
                            'region': region,
                            'pricing_model': 'on-demand',
                            'hourly_price': float(item.get('unitPrice', item.get('retailPrice', 0)))
                        })
                    
                    url = data.get('NextPageLink')
                    params = {}
                
                return prices
        except Exception as e:
            print(f"Error fetching Azure pricing: {e}")
            raise Exception(f"Error fetching Azure pricing: {str(e)}")
