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
AZURE_PRICING_API_URL = "https://prices.azure.com/api/retail/prices"
CACHE_DIR = "/app/cache"
STATE_FILE = os.path.join(CACHE_DIR, "ingestion_state.json")


def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def load_state():
    if not os.path.exists(STATE_FILE):
        return {}
    with open(STATE_FILE, "r") as f:
        return json.load(f)


def save_state(state):
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


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


def download_static_file(url, file_path):
    print(f"Downloading static file from {url}...")
    try:
        with open(file_path, "wb") as f:
            with httpx.stream("GET", url, timeout=300.0) as response:
                response.raise_for_status()
                total_size = int(response.headers["Content-Length"])
                with tqdm(
                    total=total_size,
                    unit="B",
                    unit_scale=True,
                    desc=os.path.basename(file_path),
                ) as pbar:
                    for chunk in response.iter_bytes():
                        f.write(chunk)
                        pbar.update(len(chunk))
        print("Download complete.")
        return True
    except (httpx.HTTPStatusError, httpx.ReadTimeout, KeyError) as e:
        print(f"An error occurred while downloading static file: {e}")
        return False


def run_aws_ec2_ingestion():
    print("\n--- Starting AWS EC2 Price Ingestion ---")
    state = load_state()

    print(f"Fetching AWS pricing index...")
    response = httpx.get(AWS_PRICING_INDEX_URL)
    response.raise_for_status()
    index_data = response.json()

    publication_date = index_data["publicationDate"]
    if state.get("aws_ec2_publication_date") == publication_date:
        print("AWS EC2 prices are up to date. Skipping.")
        return

    offer = index_data["offers"]["AmazonEC2"]
    offer_url = f"https://pricing.us-east-1.amazonaws.com{offer['currentVersionUrl']}"
    cache_file_path = os.path.join(CACHE_DIR, "AmazonEC2_offer.json")

    if not download_static_file(offer_url, cache_file_path):
        return

    print("Pass 1: Building map of relevant products...")
    product_map = {}
    with open(cache_file_path, "rb") as f:
        for sku, product in ijson.kvitems(f, "products"):
            attributes = product.get("attributes", {})
            if (
                product.get("productFamily") == "Compute Instance"
                and "instanceType" in attributes
                and "location" in attributes
            ):
                product_map[sku] = attributes

    print(f"Found {len(product_map)} relevant products. Pass 2: Processing prices...")
    prices_to_insert = []
    with open(cache_file_path, "rb") as f:
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

    state["aws_ec2_publication_date"] = publication_date
    save_state(state)
    print("--- AWS EC2 Price Ingestion Finished ---")


def run_azure_vm_ingestion():
    print("\n--- Starting Azure VM Price Ingestion ---")
    state = load_state()
    today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if state.get("azure_vm_ingestion_date") == today_date:
        print("Azure VM prices were already ingested today. Skipping.")
        return

    cache_file_path = os.path.join(CACHE_DIR, "AzureVM_offer.json")

    if not os.path.exists(cache_file_path):
        print("Azure cache is missing. Downloading all pages from Azure API...")
        all_items = []
        next_page_url = (
            AZURE_PRICING_API_URL + "?$filter=serviceName eq 'Virtual Machines'"
        )
        page_num = 1

        while next_page_url:
            print(f"Fetching page {page_num}...")
            response = httpx.get(next_page_url, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            all_items.extend(data.get("Items", []))
            next_page_url = data.get("NextPageLink")
            page_num += 1

        with open(cache_file_path, "w") as f:
            json.dump({"Items": all_items}, f)
        print(f"Download complete. Saved {len(all_items)} items to cache.")
    else:
        print("Using cached Azure offer file.")

    print("Processing Azure prices from cache...")
    prices_to_insert = []
    with open(cache_file_path, "rb") as f:
        for item in ijson.items(f, "Items.item"):
            if (
                "armSkuName" in item
                and "armRegionName" in item
                and item.get("unitOfMeasure") == "1 Hour"
            ):
                prices_to_insert.append(
                    {
                        "provider": "azure",
                        "service": "Virtual Machines",
                        "resourceType": item["armSkuName"],
                        "region": item["armRegionName"],
                        "priceModel": "on-demand",
                        "pricePerHour": float(item["retailPrice"]),
                        "currency": item["currencyCode"],
                    }
                )

    print(f"Transformed {len(prices_to_insert)} Azure prices for database insertion.")
    insert_prices_to_db(prices_to_insert)

    state["azure_vm_ingestion_date"] = today_date
    save_state(state)
    print("--- Azure VM Price Ingestion Finished ---")


if __name__ == "__main__":
    try:
        run_aws_ec2_ingestion()
        run_azure_vm_ingestion()
    except Exception as e:
        print(f"An unexpected error occurred in the main process: {e}")
