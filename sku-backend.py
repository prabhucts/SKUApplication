from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite DB setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./skuapp.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SkuDB(Base):
    __tablename__ = "skus"
    skuNumber = Column(String, primary_key=True, index=True)
    ndc = Column(String, index=True)
    productName = Column(String)
    manufacturer = Column(String)
    strength = Column(String)
    form = Column(String)
    packageSize = Column(String)
    status = Column(String)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# In-memory SKU store (replace with DB in production)
skus = {}

class Sku(BaseModel):
    skuNumber: str
    ndc: str
    productName: str
    manufacturer: str
    strength: str
    form: str
    packageSize: str
    status: str

@app.get("/api/skus", response_model=List[Sku])
def search_skus(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(SkuDB)
    if search:
        query = query.filter((SkuDB.productName.ilike(f"%{search}%")) | (SkuDB.skuNumber.ilike(f"%{search}%")))
    return [Sku(**sku.__dict__) for sku in query.all()]

@app.get("/api/skus/{skuNumber}", response_model=Sku)
def get_sku(skuNumber: str, db: Session = Depends(get_db)):
    sku = db.query(SkuDB).filter(SkuDB.skuNumber == skuNumber).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    return Sku(**sku.__dict__)

@app.post("/api/skus", response_model=Sku)
def add_sku(sku: Sku, db: Session = Depends(get_db)):
    if db.query(SkuDB).filter(SkuDB.skuNumber == sku.skuNumber).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    db_sku = SkuDB(**sku.dict())
    db.add(db_sku)
    db.commit()
    db.refresh(db_sku)
    return Sku(**db_sku.__dict__)

@app.put("/api/skus/{skuNumber}", response_model=Sku)
def update_sku(skuNumber: str, sku: Sku, db: Session = Depends(get_db)):
    db_sku = db.query(SkuDB).filter(SkuDB.skuNumber == skuNumber).first()
    if not db_sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    for field, value in sku.dict().items():
        setattr(db_sku, field, value)
    db.commit()
    db.refresh(db_sku)
    return Sku(**db_sku.__dict__)

@app.delete("/api/skus/{skuNumber}")
def delete_sku(skuNumber: str, db: Session = Depends(get_db)):
    db_sku = db.query(SkuDB).filter(SkuDB.skuNumber == skuNumber).first()
    if not db_sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    db_sku.status = "Deleted"
    db.commit()
    return {"detail": "SKU soft-deleted"}

# --- Add initial SKUs if DB is empty ---
def seed_initial_skus():
    db = SessionLocal()
    if db.query(SkuDB).count() == 0:
        initial_skus = [
            SkuDB(
                skuNumber="10001",
                ndc="12345-1001-01",
                productName="Acetaminophen 500mg",
                manufacturer="Pharma Inc.",
                strength="500mg",
                form="Tablet",
                packageSize="100",
                status="Active"
            ),
            SkuDB(
                skuNumber="10002",
                ndc="12345-1002-01",
                productName="Ibuprofen 200mg",
                manufacturer="HealthCorp",
                strength="200mg",
                form="Tablet",
                packageSize="50",
                status="Active"
            ),
            SkuDB(
                skuNumber="10003",
                ndc="12345-1003-01",
                productName="Amoxicillin 250mg",
                manufacturer="MedLife",
                strength="250mg",
                form="Capsule",
                packageSize="30",
                status="Active"
            ),
            SkuDB(
                skuNumber="10004",
                ndc="12345-1004-01",
                productName="Lisinopril 10mg",
                manufacturer="CardioPharm",
                strength="10mg",
                form="Tablet",
                packageSize="90",
                status="Active"
            ),
            SkuDB(
                skuNumber="10005",
                ndc="12345-1005-01",
                productName="Metformin 500mg",
                manufacturer="GlucoCare",
                strength="500mg",
                form="Tablet",
                packageSize="60",
                status="Active"
            )
        ]
        db.add_all(initial_skus)
        db.commit()
    db.close()

seed_initial_skus()
