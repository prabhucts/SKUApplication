#!/bin/bash
# Script to set up PostgreSQL database in Azure

# Check if command line arguments are provided
if [ "$#" -ge 4 ]; then
    PGSERVER=$1
    PGDATABASE=$2
    PGUSER=$3
    PGPASSWORD=$4
    PGHOST="${PGSERVER}.postgres.database.azure.com"
else
    # Variables - Replace these with your actual Azure PostgreSQL details or provide as command line arguments
    echo "Usage: $0 <server-name> <database-name> <username> <password>"
    echo "Example: $0 my-azure-postgres skuapp admin P@ssw0rd"
    echo ""
    echo "No arguments provided. Using default/configured values..."
    
    # Prompt for values if not provided
    read -p "Enter Azure PostgreSQL server name (without domain): " PGSERVER
    read -p "Enter database name [skuapp]: " PGDATABASE
    PGDATABASE=${PGDATABASE:-skuapp}
    read -p "Enter admin username: " PGUSER
    read -s -p "Enter admin password: " PGPASSWORD
    echo ""
    
    PGHOST="${PGSERVER}.postgres.database.azure.com"
fi

# Set PostgreSQL connection string
export PGPASSWORD=$PGPASSWORD

echo "Connecting to Azure PostgreSQL server: $PGHOST"
echo "Using database: $PGDATABASE"

# Test connection
echo "Testing database connection..."
psql -h $PGHOST -U $PGUSER -d postgres -c "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Could not connect to PostgreSQL server. Please check your credentials and network connectivity."
    exit 1
fi

echo "Creating database if it doesn't exist..."
psql -h $PGHOST -U $PGUSER -d postgres -c "CREATE DATABASE $PGDATABASE;" || echo "Database may already exist"

echo "Creating schema..."
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f ./backend/sql/postgres_schema.sql

echo "Importing sample data..."
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f ./backend/sql/postgres_sample_data.sql

echo "Database setup complete!"
echo ""
echo "Use the following DATABASE_URL in your environment:"
echo "DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@$PGHOST/$PGDATABASE"
