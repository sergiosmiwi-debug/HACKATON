from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import enum

DATABASE_URL = "sqlite:///./freshtrack.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ProductStatus(str, enum.Enum):
    fresh = "fresh"
    warning = "warning"
    danger = "danger"
    expired = "expired"
    discarded = "discarded"

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, default="otros")
    quantity = Column(String, default="1")
    purchase_date = Column(DateTime, default=datetime.utcnow)
    opened_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    purchase_price = Column(Float, default=0.0)
    status = Column(String, default=ProductStatus.fresh)
    phone_number = Column(String, nullable=True)
    notified = Column(Integer, default=0)
    device_id = Column(String, nullable=True, default=None)

class WasteLog(Base):
    __tablename__ = "waste_logs"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String)
    price = Column(Float)
    discarded_at = Column(DateTime, default=datetime.utcnow)
    phone_number = Column(String, nullable=True)
    device_id = Column(String, nullable=True, default=None)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
