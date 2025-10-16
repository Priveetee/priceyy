import boto3
import json
from typing import List, Dict

class AWSPricingService:
    
    def __init__(self, region: str = 'us-east-1'):
        self.client = boto3.client('pricing', region_name=region)
    
    async def fetch_ec2_prices(self, instance_type: str, region: str) -> List[Dict]:
        try:
            response = self.client.get_products(
                ServiceCode='AmazonEC2',
                Filters=[
                    {'Type': 'TERM_MATCH', 'Field': 'instanceType', 'Value': instance_type},
                    {'Type': 'TERM_MATCH', 'Field': 'location', 'Value': region},
                    {'Type': 'TERM_MATCH', 'Field': 'operatingSystem', 'Value': 'Linux'},
                    {'Type': 'TERM_MATCH', 'Field': 'preInstalledSw', 'Value': 'NA'}
                ],
                MaxResults=100
            )
            
            prices = []
            for price_item in response['PriceList']:
                item = json.loads(price_item)
                
                sku = list(item['terms']['OnDemand'].keys())[0]
                price_data = item['terms']['OnDemand'][sku]
                price_dimension = list(price_data['priceDimensions'].keys())[0]
                hourly_price = float(price_data['priceDimensions'][price_dimension]['pricePerUnit']['USD'])
                
                prices.append({
                    'service': 'EC2',
                    'resource_type': instance_type,
                    'region': region,
                    'pricing_model': 'on-demand',
                    'hourly_price': hourly_price
                })
            
            return prices
        except Exception as e:
            raise Exception(f"Error fetching AWS pricing: {str(e)}")
    
    async def fetch_rds_prices(self, db_type: str, region: str) -> List[Dict]:
        try:
            response = self.client.get_products(
                ServiceCode='AmazonRDS',
                Filters=[
                    {'Type': 'TERM_MATCH', 'Field': 'databaseEngine', 'Value': 'PostgreSQL'},
                    {'Type': 'TERM_MATCH', 'Field': 'dbInstanceClass', 'Value': db_type},
                    {'Type': 'TERM_MATCH', 'Field': 'location', 'Value': region}
                ],
                MaxResults=100
            )
            
            prices = []
            for price_item in response['PriceList']:
                item = json.loads(price_item)
                
                sku = list(item['terms']['OnDemand'].keys())[0]
                price_data = item['terms']['OnDemand'][sku]
                price_dimension = list(price_data['priceDimensions'].keys())[0]
                hourly_price = float(price_data['priceDimensions'][price_dimension]['pricePerUnit']['USD'])
                
                prices.append({
                    'service': 'RDS',
                    'resource_type': db_type,
                    'region': region,
                    'pricing_model': 'on-demand',
                    'hourly_price': hourly_price
                })
            
            return prices
        except Exception as e:
            raise Exception(f"Error fetching RDS pricing: {str(e)}")
