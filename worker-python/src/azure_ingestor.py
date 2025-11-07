import json
import os
import time
from datetime import datetime, timezone

import httpx
import ijson
from tqdm import tqdm

from .db_utils import insert_prices_to_db
from .state_manager import CACHE_DIR, load_state, save_state

AZURE_PRICING_API_URL = "https://prices.azure.com/api/retail/prices"


def ingest(force=False):
    print("\n--- Starting Azure Price Ingestion ---")
    state = load_state()
    today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    state_key = "azure_ingestion_date"
    if not force and state.get(state_key) == today_date:
        print("Azure prices were already ingested today. Skipping.")
        return

    cache_file_path = os.path.join(CACHE_DIR, "Azure_full_offer.json")

    if not os.path.exists(cache_file_path):
        print("Downloading all pages from Azure API. This may take several minutes...")
        all_items = []
        next_page_url = AZURE_PRICING_API_URL
        try:
            with tqdm(desc="Fetching Azure pages") as pbar:
                while next_page_url:
                    retries = 3
                    for attempt in range(retries):
                        try:
                            response = httpx.get(next_page_url, timeout=60.0)
                            response.raise_for_status()
                            data = response.json()
                            all_items.extend(data.get("Items", []))
                            next_page_url = data.get("NextPageLink")
                            pbar.update(1)
                            break
                        except (httpx.ReadError, httpx.RemoteProtocolError) as e:
                            if attempt < retries - 1:
                                print(f"Network error: {e}. Retrying in 5 seconds...")
                                time.sleep(5)
                            else:
                                raise
        except Exception as e:
            print(f"Failed to download Azure data after multiple retries: {e}")
            return

        with open(cache_file_path, "w") as f:
            json.dump({"Items": all_items}, f)
        print(f"Download complete. Saved {len(all_items)} items to cache.")
    else:
        print("Azure cache file already exists. Skipping download.")

    print("Processing Azure prices from cache...")
    prices_to_insert = []
    with open(cache_file_path, "rb") as f:
        for item in ijson.items(f, "Items.item"):
            if (
                item.get("meterName")
                and item.get("armRegionName")
                and "reservationTerm" not in item
            ):
                prices_to_insert.append(
                    {
                        "provider": "azure",
                        "service": item["serviceName"],
                        "resourceType": item["meterName"],
                        "region": item["armRegionName"],
                        "priceModel": "on-demand",
                        "pricePerUnit": float(item["retailPrice"]),
                        "unitOfMeasure": item["unitOfMeasure"],
                        "currency": item["currencyCode"],
                    }
                )

    print(f"Transformed {len(prices_to_insert)} Azure prices for database insertion.")
    insert_prices_to_db(prices_to_insert)

    state[state_key] = today_date
    save_state(state)
    print("--- Azure Price Ingestion Finished ---")
