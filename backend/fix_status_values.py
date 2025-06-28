#!/usr/bin/env python3
from sqlalchemy import create_engine, Column, String
from sqlalchemy.orm import sessionmaker
from models import Base, DrugSKU, SKUStatus

# Create engine
SQLALCHEMY_DATABASE_URL = "sqlite:///./sku_database.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def fix_invalid_status_values():
    print("Fixing invalid status values in the database...")
    
    # Find all SKUs with invalid status values
    all_skus = db.query(DrugSKU).all()
    valid_statuses = [status.value for status in SKUStatus]
    
    fixed_count = 0
    
    for sku in all_skus:
        if sku.status not in valid_statuses:
            print(f"Found invalid status '{sku.status}' for SKU ID: {sku.id}, NDC: {sku.ndc}")
            # Change 'ACTIVE' to 'APPROVED'
            if sku.status == 'ACTIVE':
                sku.status = 'APPROVED'
                print(f"  - Updated status to 'APPROVED'")
                fixed_count += 1
            else:
                # For any other invalid status, set to DRAFT
                sku.status = 'DRAFT'
                print(f"  - Updated unknown status to 'DRAFT'")
                fixed_count += 1
    
    # Commit changes
    if fixed_count > 0:
        db.commit()
        print(f"Successfully fixed {fixed_count} SKU records")
    else:
        print("No invalid status values found")
    
    # Verify all statuses are now valid
    invalid_count = db.query(DrugSKU).filter(~DrugSKU.status.in_(valid_statuses)).count()
    if invalid_count == 0:
        print("Verification successful: All SKU records now have valid status values")
    else:
        print(f"WARNING: {invalid_count} SKUs still have invalid status values")

if __name__ == "__main__":
    fix_invalid_status_values()
