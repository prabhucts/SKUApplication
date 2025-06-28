#!/bin/bash

# Simple test script to create a SKU via curl
echo "Testing SKU creation via curl..."

# Create a test SKU
curl -X POST http://localhost:5000/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "ndc": "12345-6789-02",
    "name": "Test Drug From Curl 2",
    "manufacturer": "Test Manufacturer",
    "dosage_form": "Tablet",
    "strength": "10mg",
    "package_size": "30 tablets",
    "status": "DRAFT"
  }' | jq

echo "Testing completed."
