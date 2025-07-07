-- PostgreSQL Schema for SKU Management Application
-- This file contains the DDL statements to create the necessary tables in PostgreSQL

-- Drop tables if they already exist (safe for fresh installation)
DROP TABLE IF EXISTS drug_skus CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS attributes CASCADE;
DROP TABLE IF EXISTS skus CASCADE;

-- Create the original skus table (legacy schema)
CREATE TABLE skus (
    sku TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attributes table for SKU properties
CREATE TABLE attributes (
    id SERIAL PRIMARY KEY,
    sku TEXT NOT NULL REFERENCES skus(sku) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create images table for SKU images
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    sku TEXT NOT NULL REFERENCES skus(sku) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drug_skus table for the main application data
CREATE TABLE drug_skus (
    id SERIAL PRIMARY KEY,
    ndc TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    dosage_form TEXT NOT NULL,
    strength TEXT NOT NULL,
    package_size TEXT NOT NULL,
    gtin TEXT,
    image_url TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP,
    created_by TEXT,
    reviewed_by TEXT
);

-- Create index on ndc field for faster lookups
CREATE INDEX idx_drug_skus_ndc ON drug_skus(ndc);
CREATE INDEX idx_drug_skus_name ON drug_skus(name);

-- Create enum type for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skustatus') THEN
        CREATE TYPE skustatus AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DELETED');
    END IF;
END
$$;

-- Add comments for documentation
COMMENT ON TABLE drug_skus IS 'Main table for storing drug SKU information';
COMMENT ON COLUMN drug_skus.ndc IS 'National Drug Code - unique identifier';
COMMENT ON COLUMN drug_skus.status IS 'Current status in workflow: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, DELETED';
