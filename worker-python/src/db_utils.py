import os

import psycopg2


def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


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
