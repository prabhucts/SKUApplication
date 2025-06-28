#!/bin/bash
echo "SKU Management System - Backend API Test"
echo "========================================"

# Test if backend is running
echo "Testing backend connection..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:5000/api/skus

# Get all SKUs
echo -e "\nGetting all SKUs:"
curl -s http://localhost:5000/api/skus | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Found {len(data)} SKUs')
    for i, sku in enumerate(data[:3]):  # Show first 3
        print(f'  {i+1}. {sku[\"name\"]} - {sku[\"manufacturer\"]} ({sku[\"ndc\"]})')
    if len(data) > 3:
        print(f'  ... and {len(data) - 3} more')
except:
    print('No valid JSON response')
"

# Test search
echo -e "\nTesting search for 'aspirin':"
curl -s "http://localhost:5000/api/skus?name=aspirin" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Search returned {len(data)} results')
    for sku in data:
        print(f'  - {sku[\"name\"]} by {sku[\"manufacturer\"]}')
except:
    print('No valid JSON response')
"

echo -e "\nBackend test complete!"
