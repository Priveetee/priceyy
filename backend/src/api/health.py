from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.services.pricing_service import PricingService
from src.services.aws_pricing_service import AWSPricingService
from src.services.azure_pricing_service import AzurePricingService

router = APIRouter()

@router.post("/refresh-aws-prices")
async def refresh_aws_prices(db: Session = Depends(get_db)):
    try:
        aws_service = AWSPricingService()
        
        prices = await aws_service.fetch_ec2_prices('t3.large', 'EU (Ireland)')
        
        for price in prices:
            PricingService.update_price_if_changed(
                db=db,
                provider='aws',
                service_name=price['service'],
                resource_type=price['resource_type'],
                region='eu-west-1',
                pricing_model=price['pricing_model'],
                new_hourly_price=price['hourly_price']
            )
        
        return {"status": "ok", "prices_updated": len(prices)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/refresh-azure-prices")
async def refresh_azure_prices(db: Session = Depends(get_db)):
    try:
        azure_service = AzurePricingService()
        
        prices = await azure_service.fetch_vm_prices('Standard_D4s_v3', 'westeurope')
        
        for price in prices:
            PricingService.update_price_if_changed(
                db=db,
                provider='azure',
                service_name=price['service'],
                resource_type=price['resource_type'],
                region='westeurope',
                pricing_model=price['pricing_model'],
                new_hourly_price=price['hourly_price']
            )
        
        return {"status": "ok", "prices_updated": len(prices)}
    except Exception as e:
        return {"status": "error", "message": str(e)}
