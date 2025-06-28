from models import *
from sqlalchemy.orm import sessionmaker

# Initialize database
init_db()
Session = sessionmaker(bind=engine)
session = Session()

# Create sample SKUs for testing
sample_skus = [
    DrugSKU(
        ndc='12345-678-90',
        name='Aspirin 81mg Tablets',
        manufacturer='Generic Pharma',
        dosage_form='Tablet',
        strength='81mg',
        package_size='100 tablets',
        status=SKUStatus.APPROVED
    ),
    DrugSKU(
        ndc='98765-432-10',
        name='Ibuprofen 200mg Capsules',
        manufacturer='MedCorp',
        dosage_form='Capsule',
        strength='200mg',
        package_size='50 capsules',
        status=SKUStatus.PENDING_REVIEW
    ),
    DrugSKU(
        ndc='11111-222-33',
        name='Acetaminophen 500mg Tablets',
        manufacturer='HealthPlus',
        dosage_form='Tablet',
        strength='500mg',
        package_size='200 tablets',
        status=SKUStatus.APPROVED
    )
]

# Add sample data
for sku in sample_skus:
    existing = session.query(DrugSKU).filter_by(ndc=sku.ndc).first()
    if not existing:
        session.add(sku)

session.commit()
print(f'Sample data created. Total SKUs: {session.query(DrugSKU).count()}')
session.close()
