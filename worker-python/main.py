import os

print("Hello from the Python Worker!")
db_url = os.getenv("DATABASE_URL")
print(f"Connecting to database at: {db_url}")
