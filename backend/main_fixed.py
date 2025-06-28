from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from models import DrugSKU, SKUStatus, engine, init_db, SessionLocal
from pydantic import BaseModel

app = FastAPI(title="Drug SKU Management API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class SKUSearchCriteria(BaseModel):
    ndc: Optional[str] = None
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    status: Optional[str] = None
    page: Optional[int] = 0
    pageSize: Optional[int] = 10

class SKUResponse(BaseModel):
    id: Optional[str]
    sku_number: str
    ndc: str
    name: str
    product_name: str
    manufacturer: str
    dosage_form: str
    strength: str
    form: str
    package_size: str
    status: str
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SKUCreate(BaseModel):
    sku_number: str
    ndc: str
    name: str
    product_name: str
    manufacturer: str
    dosage_form: str
    strength: str
    form: str
    package_size: str
    status: str = "DRAFT"

class SKUSearchResponse(BaseModel):
    items: List[SKUResponse]
    total: int

# Routes
@app.get("/api/skus", response_model=SKUSearchResponse)
async def search_skus(
    ndc: Optional[str] = None,
    name: Optional[str] = None,
    manufacturer: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 0,
    pageSize: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(DrugSKU)
    
    if ndc:
        query = query.filter(DrugSKU.ndc.contains(ndc))
    if name:
        query = query.filter(DrugSKU.name.contains(name))
    if manufacturer:
        query = query.filter(DrugSKU.manufacturer.contains(manufacturer))
    if status:
        query = query.filter(DrugSKU.status == status)
    
    total = query.count()
    skus = query.offset(page * pageSize).limit(pageSize).all()
    
    return SKUSearchResponse(
        items=[SKUResponse.from_orm(sku) for sku in skus],
        total=total
    )

@app.get("/api/skus/{sku_id}", response_model=SKUResponse)
async def get_sku(sku_id: str, db: Session = Depends(get_db)):
    sku = db.query(DrugSKU).filter(DrugSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    return SKUResponse.from_orm(sku)

@app.post("/api/skus", response_model=SKUResponse)
async def create_sku(sku_data: SKUCreate, db: Session = Depends(get_db)):
    sku = DrugSKU(**sku_data.dict())
    db.add(sku)
    db.commit()
    db.refresh(sku)
    return SKUResponse.from_orm(sku)

@app.put("/api/skus/{sku_id}", response_model=SKUResponse)
async def update_sku(sku_id: str, sku_data: SKUCreate, db: Session = Depends(get_db)):
    sku = db.query(DrugSKU).filter(DrugSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    
    for key, value in sku_data.dict().items():
        setattr(sku, key, value)
    
    db.commit()
    db.refresh(sku)
    return SKUResponse.from_orm(sku)

@app.delete("/api/skus/{sku_id}")
async def delete_sku(sku_id: str, db: Session = Depends(get_db)):
    sku = db.query(DrugSKU).filter(DrugSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    
    db.delete(sku)
    db.commit()
    return {"message": "SKU deleted successfully"}

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {"imageUrl": f"/uploads/{filename}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
