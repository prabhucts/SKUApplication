from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, sessionmaker
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import sqlite3
import io
import re
from PIL import Image
import pytesseract
from models import DrugSKU, SKUStatus, engine, init_db
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

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize database
init_db()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Pydantic Models for API
class SKUSearchCriteria(BaseModel):
    ndc: Optional[str] = None
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    status: Optional[str] = None

class SKUUpdate(BaseModel):
    ndc: Optional[str] = None
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    package_size: Optional[str] = None
    status: Optional[str] = None
    gtin: Optional[str] = None
    image_url: Optional[str] = None

class SKUResponse(BaseModel):
    id: Optional[int]
    ndc: str
    name: str
    manufacturer: str
    dosage_form: str
    strength: str
    package_size: str
    status: str
    gtin: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SKUCreate(BaseModel):
    ndc: str
    name: str
    manufacturer: str
    dosage_form: str
    strength: str
    package_size: str
    status: str = "DRAFT"
    gtin: Optional[str] = None

class SKUSearchResponse(BaseModel):
    items: List[SKUResponse]
    total: int

class DuplicateGroup(BaseModel):
    ndc: str
    name: str
    records: List[dict]

# Routes
@app.get("/api/skus/duplicates", response_model=List[DuplicateGroup])
def find_duplicate_skus(db: Session = Depends(get_db)):
    # Import func from SQLAlchemy
    from sqlalchemy import func
    
    # First, find which names have duplicates
    name_counts = db.query(DrugSKU.name, func.count("*").label("count")) \
        .group_by(DrugSKU.name) \
        .having(func.count("*") > 1) \
        .all()
    
    if not name_counts:
        return []
        
    # For each duplicate name, get the full records
    duplicate_groups = []
    for name_info in name_counts:
        name = name_info.name
        records = db.query(DrugSKU).filter(DrugSKU.name == name).all()
        
        # Convert to dictionary representation for response
        records_dict = []
        for record in records:
            records_dict.append({
                "id": record.id,
                "ndc": record.ndc,
                "name": record.name,
                "manufacturer": record.manufacturer,
                "dosage_form": record.dosage_form,
                "strength": record.strength,
                "package_size": record.package_size,
                "gtin": record.gtin,
                "status": record.status,
                "created_at": record.created_at.isoformat() if record.created_at else None,
                "last_modified": record.last_modified.isoformat() if record.last_modified else None,
                "created_by": record.created_by,
                "reviewed_by": record.reviewed_by
            })
            
        # Use the first record's NDC for the group
        duplicate_groups.append({
            "ndc": records[0].ndc,
            "name": name,
            "records": records_dict
        })
    
    return duplicate_groups

@app.get("/api/skus/{sku_id}", response_model=SKUResponse)
async def get_sku(sku_id: str, db: Session = Depends(get_db)):
    sku = db.query(DrugSKU).filter(DrugSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    return sku

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
        print(f"Filtering by NDC: {ndc}")
        query = query.filter(DrugSKU.ndc.contains(ndc))
    if name:
        print(f"Filtering by name: {name}")
        query = query.filter(DrugSKU.name.ilike(f"%{name}%"))
    if manufacturer:
        print(f"Filtering by manufacturer: {manufacturer}")
        query = query.filter(DrugSKU.manufacturer.contains(manufacturer))
    if status:
        print(f"Filtering by status: {status}")
        query = query.filter(DrugSKU.status == status)
    
    total = query.count()
    skus = query.offset(page * pageSize).limit(pageSize).all()
    
    return SKUSearchResponse(items=skus, total=total)

@app.post("/api/skus", response_model=SKUResponse)
async def create_sku(sku_data: SKUCreate, db: Session = Depends(get_db)):
    # Debug log
    print(f"Received SKU data: {sku_data}")
    
    # Check if SKU already exists
    existing = db.query(DrugSKU).filter(DrugSKU.ndc == sku_data.ndc).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU with this NDC already exists")
    
    try:
        # Use model_dump instead of deprecated dict method
        sku_dict = sku_data.model_dump(exclude_unset=False)
        print(f"Converting to model: {sku_dict}")
        
        # Create new SKU instance
        sku = DrugSKU(**sku_dict)
        db.add(sku)
        db.commit()
        db.refresh(sku)
        return sku
    except Exception as e:
        db.rollback()
        print(f"Error creating SKU: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error creating SKU: {str(e)}")

@app.put("/api/skus/{sku_id}", response_model=SKUResponse)
async def update_sku(sku_id: str, sku_data: SKUCreate, db: Session = Depends(get_db)):
    sku = db.query(DrugSKU).filter(DrugSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    
    for key, value in sku_data.dict().items():
        if hasattr(sku, key):
            setattr(sku, key, value)
    
    db.commit()
    db.refresh(sku)
    return sku

@app.patch("/api/skus/{sku_id}", response_model=SKUResponse)
async def partial_update_sku(sku_id: str, sku_data: SKUUpdate, db: Session = Depends(get_db)):
    sku = db.query(DrugSKU).filter(DrugSKU.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    
    # Only update fields that are provided
    update_data = sku_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(sku, key):
            setattr(sku, key, value)
    
    db.commit()
    db.refresh(sku)
    return sku

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
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join("uploads", filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Return the URL
    return {"imageUrl": f"/uploads/{filename}"}

@app.post("/api/extract-ocr")
async def extract_text_from_image(file: UploadFile = File(...)):
    """Extract text and structured data from uploaded image using OCR"""
    try:
        # Read image data
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Perform OCR
        extracted_text = pytesseract.image_to_string(image)
        
        # Parse OCR text to extract SKU information
        sku_data = parse_sku_from_text(extracted_text)
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "sku_data": sku_data,
            "confidence": calculate_ocr_confidence(sku_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

def parse_sku_from_text(text: str) -> Dict[str, Any]:
    """Parse OCR text to extract SKU information"""
    sku_data = {
        "ndc": "",
        "name": "",
        "manufacturer": "",
        "dosage_form": "",
        "strength": "",
        "package_size": ""
    }
    
    lines = text.split('\n')
    text_upper = text.upper()
    
    # Extract NDC (National Drug Code) - format: 12345-123-12 or similar
    ndc_pattern = r'\b\d{4,5}-\d{2,4}-\d{1,2}\b'
    ndc_match = re.search(ndc_pattern, text)
    if ndc_match:
        sku_data["ndc"] = ndc_match.group()
    
    # Extract dosage forms
    dosage_forms = ["TABLET", "CAPSULE", "INJECTION", "SOLUTION", "CREAM", "OINTMENT", "DROPS", "SYRUP"]
    for form in dosage_forms:
        if form in text_upper:
            sku_data["dosage_form"] = form.lower()
            break
    
    # Extract strength (mg, mcg, etc.)
    strength_pattern = r'\b\d+\.?\d*\s?(mg|mcg|g|ml|%)\b'
    strength_match = re.search(strength_pattern, text, re.IGNORECASE)
    if strength_match:
        sku_data["strength"] = strength_match.group()
    
    # Extract manufacturer - look for common pharma company patterns
    manufacturers = ["PFIZER", "MERCK", "ABBOTT", "NOVARTIS", "ROCHE", "GSK", "BRISTOL", "JOHNSON", "TEVA"]
    for mfg in manufacturers:
        if mfg in text_upper:
            sku_data["manufacturer"] = mfg.title()
            break
    
    # Extract product name - usually the longest capitalized phrase
    words = text.split()
    potential_names = []
    for i, word in enumerate(words):
        if word.isupper() and len(word) > 3:
            # Look for consecutive uppercase words
            name_parts = [word]
            j = i + 1
            while j < len(words) and (words[j].isupper() or words[j].isdigit()):
                name_parts.append(words[j])
                j += 1
            if len(name_parts) >= 2:
                potential_names.append(" ".join(name_parts))
    
    if potential_names:
        # Choose the longest name that's not a manufacturer
        sku_data["name"] = max(potential_names, key=len)
    
    return sku_data

def calculate_ocr_confidence(sku_data: Dict[str, Any]) -> float:
    """Calculate confidence score based on extracted data completeness"""
    filled_fields = sum(1 for value in sku_data.values() if value and value.strip())
    total_fields = len(sku_data)
    return filled_fields / total_fields

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)