#!/bin/sh

until pg_isready -h postgres -p 5432 -U ${POSTGRES_USER}; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

ROW_COUNT=$(psql ${DATABASE_URL} -t -c "SELECT COUNT(*) FROM prices;")

ROW_COUNT=$(echo $ROW_COUNT | xargs)

if [ "$ROW_COUNT" = "0" ]; then
  echo "Database is empty. Starting initial data ingestion..."
  python main.py
else
  echo "Database already contains data. Skipping initial ingestion."
fi

echo "Worker is now idle. Use 'docker compose exec worker ...' for manual commands."
exec sleep infinity
