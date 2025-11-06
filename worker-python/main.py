import json
import os
from datetime import datetime, timedelta, timezone

import httpx
import ijson
import psycopg2
from tqdm import tqdm

AWS_PRICING_INDEX_URL = (
    "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json"
)
CACHE_DIR = "/app/cache"
CACHE_VALIDITY = timedelta(hours=24)


def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def find_service_offer_url(service_code):
    print(f"Fetching AWS pricing index...")
    response = httpx.get(AWS_PRICING_INDEX_URL)
    response.raise_for_status()
    index_data = response.json()

    offer = index_data["offers"][service_code]
    offer_url_path = offer["currentVersionUrl"]
    publication_date = index_data["publicationDate"]

    full_offer_url = f"https://pricing.us-east-1.amazonaws.com{offer_url_path}"

    print(f"Found offer URL for {service_code}")
    return full_offer_url, publication_date


def get_offer_file_path(offer_url, service_code):
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_file_path = os.path.join(CACHE_DIR, f"{service_code}_offer.json")

    if os.path.exists(cache_file_path):
        file_mod_time = datetime.fromtimestamp(
            os.path.getmtime(cache_file_path), tz=timezone.utc
        )
        if datetime.now(timezone.utc) - file_mod_time < CACHE_VALIDITY:
            print(f"Cache is valid. Using cached offer file: {cache_file_path}")
            return cache_file_path

    print(f"Cache is stale or missing. Downloading the full offer file...")
    try:
        with open(cache_file_path, "wb") as f:
            with httpx.stream("GET", offer_url, timeout=300.0) as response:
                response.raise_for_status()
                total_size = int(response.headers["Content-Length"])

                with tqdm(
                    total=total_size, unit="B", unit_scale=True, desc="Downloading"
                ) as pbar:
                    for chunk in response.iter_bytes():
                        f.write(chunk)
                        pbar.update(len(chunk))
        print("Download complete. Saved to cache.")
        return cache_file_path
    except (httpx.HTTPStatusError, httpx.ReadTimeout) as e:
        print(f"An error occurred while downloading offer file: {e}")
        return None


def process_and_load_ec2_prices(offer_file_path):
    if not offer_file_path:
        print("No offer file to process.")
        return

    print("Pass 1: Building map of relevant products...")
    product_map = {}
    with open(offer_file_path, "rb") as f:
        for sku, product in ijson.kvitems(f, "products"):
            attributes = product.get("attributes", {})
            if (
                product.get("productFamily") == "Compute Instance"
                and "instanceType" in attributes
                and "location" in attributes
            ):
                product_map[sku] = attributes

    print(f"Found {len(product_map)} relevant compute instance products.")
    print("Pass 2: Processing prices for these products...")

    prices_to_insert = []
    with open(offer_file_path, "rb") as f:
        for sku, term in ijson.kvitems(f, "terms.OnDemand"):
            if sku in product_map:
                product_attributes = product_map[sku]
                for price_dimension in term.values():
                    for dim_details in price_dimension["priceDimensions"].values():
                        if dim_details["unit"] == "Hrs":
                            prices_to_insert.append(
                                {
                                    "provider": "aws",
                                    "service": "ec2",
                                    "resourceType": product_attributes["instanceType"],
                                    "region": product_attributes["location"],
                                    "priceModel": "on-demand",
                                    "pricePerHour": float(
                                        dim_details["pricePerUnit"]["USD"]
                                    ),
                                    "currency": "USD",
                                }
                            )

    print(f"Transformed {len(prices_to_insert)} prices for database insertion.")
    insert_prices_to_db(prices_to_insert)


def insert_prices_to_db(prices):
    if not prices:
        print("No new prices to insert.")
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    insert_query = """
    INSERT INTO "prices" (provider, service, resource_type, region, price_model, price_per_hour, currency, last_updated_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
    ON CONFLICT (provider, resource_type, region, price_model) DO UPDATE SET
        price_per_hour = EXCLUDED.price_per_hour,
        currency = EXCLUDED.currency,
        last_updated_at = NOW();
    """

    data_to_insert = [
        (
            p["provider"],
            p["service"],
            p["resourceType"],
            p["region"],
            p["priceModel"],
            p["pricePerHour"],
            p["currency"],
        )
        for p in prices
    ]

    print(f"Inserting/Updating {len(data_to_insert)} records into the database...")

    try:
        cursor.executemany(insert_query, data_to_insert)
        conn.commit()
        print(f"Successfully committed {cursor.rowcount} changes to the database.")
    except Exception as e:
        conn.rollback()
        print(f"Database transaction failed: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    try:
        ec2_offer_url, _ = find_service_offer_url("AmazonEC2")
        offer_file_path = get_offer_file_path(ec2_offer_url, "AmazonEC2")
        process_and_load_ec2_prices(offer_file_path)
    except Exception as e:
        print(f"An unexpected error occurred in the main process: {e}")
