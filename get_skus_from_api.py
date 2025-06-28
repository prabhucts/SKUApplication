#!/usr/bin/env python
import sys
import json
import argparse

try:
    import requests
except ImportError:
    print("Error: requests module is required. Install it with: pip install requests")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="List SKUs from the API")
    parser.add_argument("--status", help="Filter SKUs by status (e.g., APPROVED, PENDING_REVIEW)")
    parser.add_argument("--format", choices=["table", "json"], default="table", help="Output format")
    args = parser.parse_args()
    
    # Define API URL
    api_url = "http://localhost:5000/api/skus"
    
    # Add status filter if provided
    params = {}
    if args.status:
        params["status"] = args.status
        
    print(f"Connecting to API at: {api_url}")
    if args.status:
        print(f"Filtering by status: {args.status}")
    
    try:
        # Make the API request
        response = requests.get(api_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            skus = data.get("items", [])
            
            # Print SKUs in the requested format
            print(f"Found {len(skus)} SKUs:")
            
            if args.format == "json":
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
                
    except Exception as e:
        print(f"Error connecting to API: {str(e)}")

if __name__ == "__main__":
    main()
