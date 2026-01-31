#!/bin/bash

# This script seeds the Google Cloud SQL database with sample data.

# Usage: ./scripts/seed-gcp-db.sh --seed

# Check for the --seed flag
if [ "$1" != "--seed" ]; then
  echo "Usage: ./scripts/seed-gcp-db.sh --seed"
  exit 1
fi

# Kill any existing cloud_sql_proxy processes
killall cloud_sql_proxy

GCP_SQL_INSTANCE_CONNECTION_NAME="contoso-outdoor:us-central1:contoso-chat-db-instance"
GCP_SQL_DATABASE_NAME="contoso-chat-db"
GCP_SQL_USER="contoso-chat-user"
GCP_SQL_PASSWORD="password"

# Start the Cloud SQL Auth Proxy
/opt/homebrew/share/google-cloud-sdk/bin/cloud_sql_proxy -instances=$GCP_SQL_INSTANCE_CONNECTION_NAME=tcp:5432 &

# Wait for the proxy to start
sleep 5

# Set the PGPASSWORD environment variable
export PGPASSWORD=$GCP_SQL_PASSWORD

# Create the tables
/opt/homebrew/bin/psql -h 127.0.0.1 -U $GCP_SQL_USER -d $GCP_SQL_DATABASE_NAME -c "DROP TABLE IF EXISTS products; CREATE TABLE products (product_id INTEGER PRIMARY KEY, name VARCHAR(255), price NUMERIC, category VARCHAR(255), brand VARCHAR(255), description TEXT);"
/opt/homebrew/bin/psql -h 127.0.0.1 -U $GCP_SQL_USER -d $GCP_SQL_DATABASE_NAME -c "CREATE TABLE IF NOT EXISTS customers (customer_id VARCHAR(255) PRIMARY KEY, firstName VARCHAR(255), lastName VARCHAR(255), age INTEGER, membership VARCHAR(255));"

# Import the product data
python3 scripts/import-products.py | /opt/homebrew/bin/psql -h 127.0.0.1 -U $GCP_SQL_USER -d $GCP_SQL_DATABASE_NAME

# Import the customer data
for file in data/customer_info/*.json; do
  customer_id=$(jq -r '.customer_id' "$file")
  if [ "$customer_id" != "null" ]; then
    firstName=$(jq -r '.firstName' "$file")
    lastName=$(jq -r '.lastName' "$file")
    age=$(jq -r '.age' "$file")
    membership=$(jq -r '.membership' "$file")
    /opt/homebrew/bin/psql -h 127.0.0.1 -U $GCP_SQL_USER -d $GCP_SQL_DATABASE_NAME -c "INSERT INTO customers (customer_id, firstName, lastName, age, membership) VALUES ('$customer_id', '$firstName', '$lastName', $age, '$membership') ON CONFLICT (customer_id) DO NOTHING;"
  fi
done

# Stop the Cloud SQL Auth Proxy
killall cloud_sql_proxy
