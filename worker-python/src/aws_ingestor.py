import os
from datetime import datetime, timezone

import httpx
import ijson
from tqdm import tqdm

from .db_utils import insert_prices_to_db
from .state_manager import CACHE_DIR, load_state, save_state

AWS_PRICING_INDEX_URL = (
    "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json"
)


def ingest(force=False):
    print("\n--- Starting AWS EC2 Price Ingestion ---")
    state = load_state()

    print(f"Fetching AWS pricing index...")
    try:
        response = httpx.get(AWS_PRICING_INDEX_URL)
        response.raise_for_status()
        index_data = response.json()
    except Exception as e:
        print(f"Could not fetch AWS pricing index: {e}")
        return

    publication_date = index_data["publicationDate"]
    if not force and state.get("aws_ec2_publication_date") == publication_date:
        print("AWS EC2 prices are up to date. Skipping.")
        return

    offer = index_data["offers"]["AmazonEC2"]
    offer_url = f"https://pricing.us-east-1.amazonaws.com{offer['currentVersionUrl']}"
    cache_file_path = os.path.join(CACHE_DIR, "AmazonEC2_offer.json")

    _download_static_file(offer_url, cache_file_path)

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


def _download_static_file(url, file_path):
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
    except (httpx.HTTPStatusError, httpx.ReadTimeout, KeyError) as e:
        print(f"An error occurred while downloading static file: {e}")
