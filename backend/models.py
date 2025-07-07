from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from enum import Enum
from datetime import datetime
from sqlalchemy.orm import sessionmaker
import os
import logging

Base = declarative_base()

class SKUStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    DELETED = "DELETED"

class DrugSKU(Base):
    __tablename__ = "drug_skus"

    id = Column(Integer, primary_key=True, index=True)
    ndc = Column(String, unique=True, index=True)  # National Drug Code
    name = Column(String, nullable=False)
    manufacturer = Column(String, nullable=False)
    dosage_form = Column(String, nullable=False)  # tablet, capsule, liquid, etc.
    strength = Column(String, nullable=False)     # e.g., "10mg", "100mg/5ml"
    package_size = Column(String, nullable=False) # e.g., "100 tablets", "500ml"
    gtin = Column(String)                        # Global Trade Item Number
    image_url = Column(String)
    status = Column(SQLEnum(SKUStatus), nullable=False, default=SKUStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_modified = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String)
    reviewed_by = Column(String)

# Get database URL from environment or use SQLite as default
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "sqlite:///./sku_database.db"
)

# Create engine with appropriate parameters based on database type
if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL engine without check_same_thread
    engine = create_engine(DATABASE_URL)
else:
    # SQLite engine with check_same_thread=False
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
