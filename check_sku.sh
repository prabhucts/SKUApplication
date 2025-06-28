#!/bin/bash
# Usage: ./check_sku.sh <ndc>
# Example: ./check_sku.sh 12345-678-90

if [ -z "$1" ]; then
  echo "Usage: $0 <ndc>"
  echo "Example: $0 12345-678-90"
  exit 1
fi

NDC="$1"

echo "Checking if SKU with NDC $NDC exists..."
curl -s "http://localhost:5000/api/skus?ndc=$NDC" | jq
