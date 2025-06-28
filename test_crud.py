#!/usr/bin/env python3
"""
SKU Management System - Full CRUD Test
Tests all Create, Read, Update, Delete operations
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

def test_crud_operations():
    print("🧪 SKU MANAGEMENT SYSTEM - FULL CRUD TEST")
    print("=" * 60)
    print(f"🕐 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test 1: CREATE (POST)
    print("➕ Testing CREATE operation...")
    create_data = {
        "ndc": f"CRUD-TEST-{datetime.now().strftime('%H%M%S')}",
        "name": "CRUD Test Drug",
        "manufacturer": "Test Pharma Ltd",
        "dosage_form": "Tablet",
        "strength": "100mg",
        "package_size": "30 tablets",
        "status": "DRAFT"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/skus", json=create_data)
        if response.status_code == 200:
            created_sku = response.json()
            sku_id = created_sku["id"]
            print(f"✅ CREATE: Successfully created SKU with ID {sku_id}")
            print(f"   NDC: {created_sku['ndc']}")
            print(f"   Name: {created_sku['name']}")
        else:
            print(f"❌ CREATE failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ CREATE error: {e}")
        return False
    
    # Test 2: READ (GET)
    print(f"\n📖 Testing READ operation...")
    try:
        response = requests.get(f"{BASE_URL}/skus/{sku_id}")
        if response.status_code == 200:
            read_sku = response.json()
            print(f"✅ READ: Successfully retrieved SKU {sku_id}")
            print(f"   NDC: {read_sku['ndc']}")
            print(f"   Status: {read_sku['status']}")
        else:
            print(f"❌ READ failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ READ error: {e}")
        return False
    
    # Test 3: UPDATE (PATCH)
    print(f"\n🔄 Testing UPDATE operation...")
    update_data = {
        "name": "Updated CRUD Test Drug",
        "strength": "200mg",
        "status": "PENDING_REVIEW"
    }
    
    try:
        response = requests.patch(f"{BASE_URL}/skus/{sku_id}", json=update_data)
        if response.status_code == 200:
            updated_sku = response.json()
            print(f"✅ UPDATE: Successfully updated SKU {sku_id}")
            print(f"   Name: {updated_sku['name']}")
            print(f"   Strength: {updated_sku['strength']}")
            print(f"   Status: {updated_sku['status']}")
        else:
            print(f"❌ UPDATE failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ UPDATE error: {e}")
        return False
    
    # Test 4: SEARCH (GET with params)
    print(f"\n🔍 Testing SEARCH operation...")
    try:
        response = requests.get(f"{BASE_URL}/skus", params={"name": "CRUD"})
        if response.status_code == 200:
            search_results = response.json()
            print(f"✅ SEARCH: Found {search_results['total']} SKUs matching 'CRUD'")
            for item in search_results['items']:
                print(f"   - {item['name']} (ID: {item['id']})")
        else:
            print(f"❌ SEARCH failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ SEARCH error: {e}")
        return False
    
    # Test 5: DELETE
    print(f"\n🗑️ Testing DELETE operation...")
    try:
        response = requests.delete(f"{BASE_URL}/skus/{sku_id}")
        if response.status_code == 200:
            print(f"✅ DELETE: Successfully deleted SKU {sku_id}")
            
            # Verify deletion
            verify_response = requests.get(f"{BASE_URL}/skus/{sku_id}")
            if verify_response.status_code == 404:
                print("✅ DELETE VERIFICATION: SKU no longer exists")
            else:
                print("⚠️ DELETE VERIFICATION: SKU still exists (soft delete?)")
        else:
            print(f"❌ DELETE failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ DELETE error: {e}")
        return False
    
    print("\n📊 CRUD TEST RESULTS")
    print("=" * 30)
    print("✅ CREATE: PASS")
    print("✅ READ: PASS")
    print("✅ UPDATE: PASS")
    print("✅ SEARCH: PASS")
    print("✅ DELETE: PASS")
    print("\n🎉 ALL CRUD OPERATIONS WORKING!")
    
    return True

if __name__ == "__main__":
    success = test_crud_operations()
    exit(0 if success else 1)
