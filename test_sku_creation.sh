#!/bin/bash

# Test SKU creation with valid status
curl -X POST http://localhost:5000/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "ndc": "11111-2222-33",
    "name": "Test Drug Via Script",
    "manufacturer": "Test Labs",
    "dosage_form": "Tablet",
    "strength": "10mg",
    "package_size": "30 tablets",
    "status": "APPROVED"
  }' | jq
