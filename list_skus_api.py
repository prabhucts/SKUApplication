#!/usr/bin/env python
# List all SKUs from the REST API

import sys
import json
import argparse

def list_skus_from_api(status_filter=None, format_output="table"):
    """Get SKUs from the API instead of directly from database"""
    try:
        import requests
        
        # Define API URL
        api_url = "http://localhost:5000/api/skus"
        
        # Add status filter if provided
        params = {}
        if status_filter:
            params['status'] = status_filter
            
        print(f"Connecting to API at: {api_url}")
        if status_filter:
            print(f"Filtering by status: {status_filter}")
        
        # Make the API request
        response = requests.get(api_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            skus = data.get('items', [])
            
            # Print SKUs in the requested format
            print(f"Found {len(skus)} SKUs:")
            
            if format_output == "json":
                print(json.dumps(skus, indent=2))
            else:
                print("-" * 80)
                for sku in skus:
                    print(f"ID: {sku.get('id', 'N/A')}")
                    print(f"NDC: {sku.get('ndc', 'N/A')}")
                    print(f"Name: {sku.get('name', 'N/A')}")
                    print(f"Manufacturer: {sku.get('manufacturer', 'N/A')}")
                    print(f"Dosage Form: {sku.get('dosage_form', 'N/A')}")
                    print(f"Strength: {sku.get('strength', 'N/A')}")
                    print(f"Package Size: {sku.get('package_size', 'N/A')}")
                    print(f"Status: {sku.get('status', 'N/A')}")
                    print("-" * 80)
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(response.text)
            
    except ImportError:
        print("Error: 'requests' module is required for API access.")
        print("Install it using: pip install requests")
        sys.exit(1)
    except Exception as e:
        print(f"Error connecting to API: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="List SKUs from the API")
    parser.add_argument("--status", help="Filter SKUs by status (e.g., APPROVED, PENDING_REVIEW)")
    parser.add_argument("--format", choices=["table", "json"], default="table", help="Output format (default: table)")
    args = parser.parse_args()
    
    list_skus_from_api(args.status, args.format)
