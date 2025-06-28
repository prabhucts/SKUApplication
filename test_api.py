#!/usr/bin/env python3
import requests
import json

def test_api():
    base_url = "http://localhost:5000/api"
    
    print("Testing SKU Management API...")
    
    try:
        # Test 1: Get all SKUs
        print("\n1. Testing GET /api/skus")
        response = requests.get(f"{base_url}/skus")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            skus = response.json()
            print(f"Found {len(skus)} SKUs")
            if skus:
                print(f"First SKU: {skus[0]['name']} by {skus[0]['manufacturer']}")
        else:
            print(f"Error: {response.text}")
            
        # Test 2: Search for a specific SKU
        print("\n2. Testing GET /api/skus?name=aspirin")
        response = requests.get(f"{base_url}/skus", params={"name": "aspirin"})
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"Search found {len(results)} results")
            
        # Test 3: Create a new SKU
        print("\n3. Testing POST /api/skus")
        new_sku = {
            "ndc": "12345-678-90",
            "name": "Test Drug",
            "manufacturer": "Test Pharma",
            "dosage_form": "Tablet",
            "strength": "100mg",
            "package_size": "30 tablets"
        }
        response = requests.post(f"{base_url}/skus", json=new_sku)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            created_sku = response.json()
            print(f"Created SKU with ID: {created_sku.get('id')}")
            test_id = created_sku.get('id')
            
            # Test 4: Delete the test SKU
            if test_id:
                print(f"\n4. Testing DELETE /api/skus/{test_id}")
                response = requests.delete(f"{base_url}/skus/{test_id}")
                print(f"Status: {response.status_code}")
                
        print("\nAPI testing complete!")
        
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend at http://localhost:5000")
        print("Make sure the backend server is running.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_api()
