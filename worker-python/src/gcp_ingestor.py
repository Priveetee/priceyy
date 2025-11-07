import json
import os
import time
from datetime import datetime, timedelta, timezone

import ijson
from google.api_core import client_options
from google.cloud import billing_v1
from tqdm import tqdm

from .db_utils import insert_prices_to_db
from .state_manager import CACHE_DIR, load_state, save_state

CACHE_VALIDITY = timedelta(hours=24)


def ingest(force=False):
    print("\n--- Starting GCP Full Price Ingestion ---")
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY not found. Skipping.")
        return

    state = load_state()
    today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    state_key = "gcp_full_ingestion_date"

    if not force and state.get(state_key) == today_date:
        print("GCP prices were already ingested today. Skipping.")
        return

    cache_file_path = os.path.join(CACHE_DIR, "GCP_full_offer.json")

    if not os.path.exists(cache_file_path) or _is_cache_stale(cache_file_path):
        if not _fetch_and_cache_gcp_data(api_key, cache_file_path):
            print("Failed to fetch and cache GCP data. Aborting ingestion.")
            return

    _process_gcp_cache(cache_file_path)

    state[state_key] = today_date
    save_state(state)
    print("--- GCP Full Price Ingestion Finished ---")


def _is_cache_stale(file_path):
    file_mod_time = datetime.fromtimestamp(os.path.getmtime(file_path), tz=timezone.utc)
    return datetime.now(timezone.utc) - file_mod_time > CACHE_VALIDITY


def _fetch_and_cache_gcp_data(api_key, cache_file_path):
    try:
        opts = client_options.ClientOptions(api_key=api_key)
        client = billing_v1.CloudCatalogClient(client_options=opts)

        print("Fetching all public services from GCP...")
        services_request = billing_v1.ListServicesRequest()
        all_services = list(client.list_services(request=services_request))
        print(f"Found {len(all_services)} services. Fetching all SKUs...")

        all_skus = []
        with tqdm(total=len(all_services), desc="Processing GCP Services") as pbar:
            for service in all_services:
                skus_request = billing_v1.ListSkusRequest(parent=service.name)
                for sku in client.list_skus(request=skus_request):
                    all_skus.append(_sku_to_dict(sku, service.display_name))

                pbar.update(1)
                time.sleep(0.2)

        print(f"Download complete. Saving {len(all_skus)} SKUs to cache...")
        with open(cache_file_path, "w") as f:
            json.dump({"skus": all_skus}, f)
        return True

    except Exception as e:
        print(f"An error occurred during GCP data fetching: {e}")
        return False


def _sku_to_dict(sku, service_display_name):
    pricing_expression = []
    if sku.pricing_info:
        for rate in sku.pricing_info[0].pricing_expression.tiered_rates:
            pricing_expression.append(
                {
                    "start_usage_amount": rate.start_usage_amount,
                    "nanos": rate.unit_price.nanos,
                    "currency_code": rate.unit_price.currency_code,
                }
            )

    return {
        "name": sku.name,
        "description": sku.description,
        "service_display_name": service_display_name,
        "regions": list(sku.geo_taxonomy.regions),
        "pricing_expression": pricing_expression,
    }


def _process_gcp_cache(cache_file_path):
    print("Processing GCP prices from cache...")
    prices_to_insert = []

    try:
        with open(cache_file_path, "rb") as f:
            for sku in ijson.items(f, "skus.item"):
                for region in sku.get("regions", []):
                    for rate in sku.get("pricing_expression", []):
                        if (
                            rate.get("start_usage_amount") == 0
                            and rate.get("nanos", 0) > 0
                        ):
                            price = rate["nanos"] / 1_000_000_000
                            prices_to_insert.append(
                                {
                                    "provider": "gcp",
                                    "service": sku["service_display_name"],
                                    "resourceType": sku["description"],
                                    "region": region,
                                    "priceModel": "on-demand",
                                    "pricePerHour": price,
                                    "currency": rate["currency_code"],
                                }
                            )
                            break

        print(f"Transformed {len(prices_to_insert)} GCP prices for database insertion.")
        insert_prices_to_db(prices_to_insert)
    except Exception as e:
        print(f"An error occurred while processing GCP cache: {e}")
