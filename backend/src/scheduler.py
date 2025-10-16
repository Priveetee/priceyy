from apscheduler.schedulers.background import BackgroundScheduler
from src.services.aws_pricing_service import AWSPricingService
from src.services.azure_pricing_service import AzurePricingService
from src.services.pricing_service import PricingService
from src.database import SessionLocal
from datetime import datetime

scheduler = BackgroundScheduler()

def refresh_all_prices():
    db = SessionLocal()
    try:
        aws_service = AWSPricingService()
        azure_service = AzurePricingService()

        instances_to_fetch = [
            ('t3.large', 'EU (Ireland)', 'eu-west-1'),
            ('t3.xlarge', 'EU (Ireland)', 'eu-west-1'),
            ('m5.2xlarge', 'EU (Ireland)', 'eu-west-1'),
        ]

        for instance_type, aws_region, db_region in instances_to_fetch:
            prices = aws_service.fetch_ec2_prices(instance_type, aws_region)
            for price in prices:
                PricingService.update_price_if_changed(
                    db=db,
                    provider='aws',
                    service_name=price['service'],
                    resource_type=price['resource_type'],
                    region=db_region,
                    pricing_model=price['pricing_model'],
                    new_hourly_price=price['hourly_price']
                )

        vms_to_fetch = [
            ('Standard_D4s_v3', 'westeurope'),
            ('Standard_D8s_v3', 'westeurope'),
        ]

        for vm_type, region in vms_to_fetch:
            prices = aws_service.fetch_vm_prices(vm_type, region)
            for price in prices:
                PricingService.update_price_if_changed(
                    db=db,
                    provider='azure',
                    service_name=price['service'],
                    resource_type=price['resource_type'],
                    region=region,
                    pricing_model=price['pricing_model'],
                    new_hourly_price=price['hourly_price']
                )

        print(f"Pricing refresh completed at {datetime.now()}")

    except Exception as e:
        print(f"Error refreshing prices: {str(e)}")
    finally:
        db.close()

def schedule_pricing_refresh():
    scheduler.add_job(
        func=refresh_all_prices,
        trigger='interval',
        hours=6,
        id='refresh_prices',
        name='Refresh cloud pricing',
        replace_existing=True
    )
    scheduler.start()

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
