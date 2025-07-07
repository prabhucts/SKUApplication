# Connecting to Azure PostgreSQL Database

This document provides instructions for configuring your SKU Management Application to use Azure PostgreSQL.

## Prerequisites

1. An Azure PostgreSQL flexible server instance
2. Database created on the server
3. Firewall rules configured to allow your application to connect

## Step 1: Update the Backend Configuration

Edit the `backend/main.py` file to use PostgreSQL connection string:

```python
# Replace SQLite connection with PostgreSQL
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "postgresql://username:password@your-server.postgres.database.azure.com/skuapp"
)

# Use this connection string with SQLAlchemy
engine = create_engine(DATABASE_URL)
```

## Step 2: Install PostgreSQL Dependencies

Add the following to your `backend/requirements.txt` file:

```
psycopg2-binary==2.9.9
```

Then install it:

```bash
pip install -r requirements.txt
```

## Step 3: Set Environment Variables in Azure

When deploying to Azure Web App, set the following environment variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `CORS_ORIGINS`: URLs of your frontend application

## Step 4: Initialize the Database

Run the provided script to set up your Azure PostgreSQL database:

```bash
# Edit the setup_azure_postgres.sh script first to add your credentials
./setup_azure_postgres.sh
```

## Step 5: Update the Azure App Service Configuration

Make sure the Azure App Service has the proper connection strings and environment variables set in the Configuration section.

## Troubleshooting

- Ensure your Azure PostgreSQL firewall allows connections from your application
- Check SSL requirements for PostgreSQL connections
- Verify that the database user has appropriate permissions
