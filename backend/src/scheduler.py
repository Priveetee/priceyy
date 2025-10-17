from apscheduler.schedulers.background import BackgroundScheduler
from src.services.aws_pricing_service import AWSPricingService
from src.services.azure_pricing_service import AzurePricingService
from src.services.pricing_service import PricingService
from src.database import SessionLocal
from src.models.pricing import Pricing
from datetime import datetime
import asyncio
import logging
import json

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()
last_successful_run = None

async def refresh_all_prices():
    global last_successful_run
    db = SessionLocal()
    start_time = datetime.utcnow()
    
    try:
        aws_service = AWSPricingService()
        azure_service = AzurePricingService()
        
        aws_prices = db.query(Pricing).filter(Pricing.provider == 'aws').all()
        aws_by_type = {}
        for price in aws_prices:
            key = (price.resource_type, price.region)
            if key not in aws_by_type:
                aws_by_type[key] = price
        
        aws_count = 0
        for (resource_type, region), price_obj in aws_by_type.items():
            try:
                prices = await aws_service.fetch_ec2_prices(resource_type, region)
                for price in prices:
                    PricingService.update_price_if_changed(
                        db=db,
                        provider='aws',
                        service_name=price.get('service', 'EC2'),
                        resource_type=price.get('resource_type', resource_type),
                        region=region,
                        pricing_model=price.get('pricing_model', 'on-demand'),
                        new_hourly_price=price.get('hourly_price', 0.0)
                    )
                    aws_count += 1
            except Exception as e:
                logger.error(json.dumps({
                    "event": "scheduler.aws_fetch_error",
                    "resource_type": resource_type,
                    "region": region,
                    "error": str(e)
                }))
        
        azure_prices = db.query(Pricing).filter(Pricing.provider == 'azure').all()
        azure_by_type = {}
        for price in azure_prices:
            key = (price.resource_type, price.region)
            if key not in azure_by_type:
                azure_by_type[key] = price
        
        azure_count = 0
        for (resource_type, region), price_obj in azure_by_type.items():
            try:
                prices = await azure_service.fetch_vm_prices(resource_type, region)
                for price in prices:
                    PricingService.update_price_if_changed(
                        db=db,
                        provider='azure',
                        service_name=price.get('service', 'VirtualMachines'),
                        resource_type=price.get('resource_type', resource_type),
                        region=region,
                        pricing_model=price.get('pricing_model', 'on-demand'),
                        new_hourly_price=price.get('hourly_price', 0.0)
                    )
                    azure_count += 1
            except Exception as e:
                logger.error(json.dumps({
                    "event": "scheduler.azure_fetch_error",
                    "resource_type": resource_type,
                    "region": region,
                    "error": str(e)
                }))
        
        duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
        last_successful_run = datetime.utcnow()
        
        logger.info(json.dumps({
            "event": "scheduler.pricing_refresh_success",
            "aws_prices_updated": aws_count,
            "azure_prices_updated": azure_count,
            "duration_ms": round(duration_ms, 2)
        }))

    except Exception as e:
        duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
        logger.critical(json.dumps({
            "event": "scheduler.pricing_refresh_failed",
            "error": str(e),
            "duration_ms": round(duration_ms, 2)
        }))
    finally:
        db.close()

def schedule_pricing_refresh():
    scheduler.add_job(
        func=lambda: asyncio.run(refresh_all_prices()),
        trigger='interval',
        hours=6,
        id='refresh_prices',
        name='Refresh cloud pricing',
        replace_existing=True,
        max_instances=1
    )
    scheduler.start()

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()

def get_scheduler_health() -> dict:
    return {
        "scheduler_running": scheduler.running,
        "last_successful_run": last_successful_run.isoformat() if last_successful_run else None,
        "jobs_scheduled": len(scheduler.get_jobs())
    }
