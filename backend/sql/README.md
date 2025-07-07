# Database Scripts for SKU Management Application

This directory contains the SQL scripts needed to set up and populate the application's database.

## Files

- `schema.sql`: DDL (Data Definition Language) statements to create the database schema for SQLite
- `sample_data.sql`: DML (Data Manipulation Language) statements to populate SQLite database with sample data
- `simplified_sample_data.sql`: Simplified DML statements for SQLite with essential test data
- `postgres_schema.sql`: DDL statements to create the database schema for PostgreSQL
- `postgres_sample_data.sql`: DML statements to populate PostgreSQL database with sample data

## How to Use

### For SQLite (Development)

```bash
# Navigate to the backend directory
cd backend

# Create a new database (or use an existing one)
sqlite3 sku_database.db < sql/schema.sql
sqlite3 sku_database.db < sql/sample_data.sql
```

### For PostgreSQL (Production/Azure)

When deploying to a production environment with PostgreSQL:

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE skuapp;"

# Apply schema and sample data
psql -U postgres -d skuapp -f sql/postgres_schema.sql
psql -U postgres -d skuapp -f sql/postgres_sample_data.sql
```

#### Azure PostgreSQL

For Azure PostgreSQL specifically:

```bash
# Connect to your Azure PostgreSQL instance
PGPASSWORD=your_password psql -h your_server.postgres.database.azure.com -U your_username@your_server -d postgres

# Create the database
CREATE DATABASE skuapp;

# Connect to the new database
\c skuapp

# Apply the schema (copy paste content or use \i if you've uploaded the file)
\i postgres_schema.sql

# Apply the sample data
\i postgres_sample_data.sql
```

## Notes

- The main table used by the application is `drug_skus`
- Legacy tables (`skus`, `attributes`, `images`) are included for backward compatibility
- When upgrading the database schema, add new migration scripts with appropriate version numbers