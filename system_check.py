#!/usr/bin/env python3
"""
SKU Management System - Status Check
This script verifies the current state of the system components.
"""

import os
import json
import subprocess
import requests
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and report status."""
    exists = os.path.exists(file_path)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {file_path}")
    return exists

def check_backend_api():
    """Check if backend API is responding."""
    try:
        response = requests.get('http://localhost:5000/api/skus', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend API: Running (found {len(data)} SKUs)")
            return True
        else:
            print(f"❌ Backend API: HTTP {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend API: Not responding (connection refused)")
        return False
    except Exception as e:
        print(f"❌ Backend API: Error - {e}")
        return False

def check_frontend_running():
    """Check if frontend development server is accessible."""
    try:
        response = requests.get('http://localhost:4200', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend: Angular dev server running")
            return True
        else:
            print(f"❌ Frontend: HTTP {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend: Not accessible (connection refused)")
        return False
    except Exception as e:
        print(f"❌ Frontend: Error - {e}")
        return False

def main():
    print("SKU Management System - Status Check")
    print("=" * 50)
    
    # Check project structure
    print("\n📁 Project Structure:")
    base_path = "/Users/prabhu/Documents/SKUApp"
    
    # Backend files
    check_file_exists(f"{base_path}/backend/main.py", "Backend main file")
    check_file_exists(f"{base_path}/backend/models.py", "Backend models")
    check_file_exists(f"{base_path}/backend/sku_database.db", "SQLite database")
    
    # Frontend files
    check_file_exists(f"{base_path}/sku-app/src/app/app.component.ts", "App component")
    check_file_exists(f"{base_path}/sku-app/src/app/new-sku.component.ts", "New SKU component")
    check_file_exists(f"{base_path}/sku-app/src/app/search-sku.component.ts", "Search component")
    check_file_exists(f"{base_path}/sku-app/src/app/delete-sku.component.ts", "Delete component")
    check_file_exists(f"{base_path}/sku-app/src/app/services/drug-sku.service.ts", "SKU service")
    
    # Check services
    print("\n🌐 Service Status:")
    backend_running = check_backend_api()
    frontend_running = check_frontend_running()
    
    # Summary
    print("\n📊 System Status Summary:")
    if backend_running and frontend_running:
        print("🎉 System is ready for testing!")
        print("\n🔗 Access URLs:")
        print("   Frontend: http://localhost:4200")
        print("   Backend API: http://localhost:5000/api/skus")
        print("\n📋 Next Steps:")
        print("   1. Open http://localhost:4200 in your browser")
        print("   2. Test the navigation menu")
        print("   3. Try creating a new SKU")
        print("   4. Test the search functionality")
        print("   5. Test the delete functionality")
    else:
        print("⚠️  System needs attention:")
        if not backend_running:
            print("   - Start backend: cd backend && python main.py")
        if not frontend_running:
            print("   - Start frontend: cd sku-app && ng serve")
    
    print("\n📚 Documentation:")
    print("   - See TESTING_GUIDE.md for detailed test cases")
    print("   - Use frontend_test.js in browser console for debugging")

if __name__ == "__main__":
    main()
