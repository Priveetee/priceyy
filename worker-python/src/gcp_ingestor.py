import os
from datetime import datetime, timezone

from google.api_core import client_options
from google.cloud import billing_v1
from tqdm import tqdm

from .db_utils import insert_prices_to_db
from .state_manager import load_state, save_state


def ingest(force=False):
    print("\n--- Starting GCP Compute Engine Price Ingestion ---")
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY not found. Skipping.")
        return

    state = load_state()
    today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if not force and state.get("gcp_compute_ingestion_date") == today_date:
        print("GCP Compute Engine prices were already ingested today. Skipping.")
        return

    try:
        opts = client_options.ClientOptions(api_key=api_key)
        client = billing_v1.CloudCatalogClient(client_options=opts)

        prices_to_insert = []

        print("Fetching all SKUs for Compute Engine. This may take a few minutes...")
        request = billing_v1.ListSkusRequest(parent="services/6F81-5844-456A")

        page_result = client.list_skus(request=request)

        for sku in tqdm(page_result, desc="Processing GCP SKUs"):
            if "Core" in sku.description or "RAM" in sku.description:
                for region in sku.geo_taxonomy.regions:
                    for rate in sku.pricing_info[0].pricing_expression.tiered_rates:
                        if (
                            rate.start_usage_amount == 0
                            and rate.unit_price.units == 0
                            and rate.unit_price.nanos > 0
                        ):
                            price = rate.unit_price.nanos / 1_000_000_000
                            prices_to_insert.append(
                                {
                                    "provider": "gcp",
                                    "service": "Compute Engine",
                                    "resourceType": sku.description,
                                    "region": region,
                                    "priceModel": "on-demand",
                                    "pricePerHour": price,
                                    "currency": rate.unit_price.currency_code,
                                }
                            )
                            break

        print(f"Transformed {len(prices_to_insert)} GCP prices for database insertion.")
        insert_prices_to_db(prices_to_insert)

        state["gcp_compute_ingestion_date"] = today_date
        save_state(state)
    except Exception as e:
        print(f"An error occurred during GCP ingestion: {e}")

    print("--- GCP Compute Engine Price Ingestion Finished ---")
