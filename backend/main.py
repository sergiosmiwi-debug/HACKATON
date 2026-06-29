from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

from models import init_db, get_db, Product, WasteLog, ProductStatus
from expiry import calculate_expiry, get_status
from gemini_service import init_gemini, scan_receipt, scan_fridge
from whatsapp_service import send_whatsapp, format_expiry_message

app = FastAPI(title="FreshTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    init_gemini()

# --- Scan endpoints ---

@app.post("/scan/receipt")
async def scan_receipt_endpoint(
    file: UploadFile = File(...),
    phone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    image_bytes = await file.read()
    items = scan_receipt(image_bytes)
    created = []
    for item in items:
        purchase_date = datetime.utcnow()
        expiry_date = calculate_expiry(item["name"], purchase_date)
        product = Product(
            name=item["name"],
            quantity=item.get("quantity", "1"),
            purchase_price=item.get("price", 0.0),
            purchase_date=purchase_date,
            expiry_date=expiry_date,
            status=get_status(expiry_date),
            phone_number=phone,
        )
        db.add(product)
        created.append(item["name"])
    db.commit()
    return {"detected": created, "count": len(created)}

@app.post("/scan/fridge")
async def scan_fridge_endpoint(
    file: UploadFile = File(...),
    phone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    image_bytes = await file.read()
    items = scan_fridge(image_bytes)
    created = []
    for item in items:
        purchase_date = datetime.utcnow()
        expiry_date = calculate_expiry(item["name"], purchase_date)
        product = Product(
            name=item["name"],
            category=item.get("category", "otros"),
            quantity=item.get("quantity", "1"),
            purchase_date=purchase_date,
            expiry_date=expiry_date,
            status=get_status(expiry_date),
            phone_number=phone,
        )
        db.add(product)
        created.append(item["name"])
    db.commit()
    return {"detected": created, "count": len(created)}

# --- Products endpoints ---

@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.status != "discarded").all()
    result = []
    for p in products:
        days_left = None
        if p.expiry_date:
            days_left = (p.expiry_date - datetime.utcnow()).days
            p.status = get_status(p.expiry_date)
        result.append({
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "quantity": p.quantity,
            "purchase_date": p.purchase_date.isoformat() if p.purchase_date else None,
            "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
            "days_left": days_left,
            "status": p.status,
            "purchase_price": p.purchase_price,
        })
    db.commit()
    return sorted(result, key=lambda x: x["days_left"] if x["days_left"] is not None else 999)

@app.post("/products/{product_id}/open")
def mark_opened(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product.opened_date = datetime.utcnow()
    product.expiry_date = calculate_expiry(product.name, product.purchase_date, product.opened_date)
    product.status = get_status(product.expiry_date)
    db.commit()
    return {"message": f"{product.name} marcado como abierto", "new_expiry": product.expiry_date.isoformat()}

@app.delete("/products/{product_id}")
def discard_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    waste = WasteLog(
        product_name=product.name,
        price=product.purchase_price,
        phone_number=product.phone_number,
    )
    db.add(waste)
    product.status = "discarded"
    db.commit()
    return {"message": f"{product.name} descartado"}

class ProductCreate(BaseModel):
    name: str
    quantity: str = "1"
    purchase_price: float = 0.0
    phone: Optional[str] = None

@app.post("/products")
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    purchase_date = datetime.utcnow()
    expiry_date = calculate_expiry(data.name, purchase_date)
    product = Product(
        name=data.name,
        quantity=data.quantity,
        purchase_price=data.purchase_price,
        purchase_date=purchase_date,
        expiry_date=expiry_date,
        status=get_status(expiry_date),
        phone_number=data.phone,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"id": product.id, "name": product.name, "expiry_date": product.expiry_date.isoformat()}

# --- Dashboard ---

@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    waste_logs = db.query(WasteLog).all()
    total_wasted = sum(w.price for w in waste_logs)
    products = db.query(Product).filter(Product.status != "discarded").all()
    expiring_soon = [p for p in products if p.expiry_date and (p.expiry_date - datetime.utcnow()).days <= 3]
    from collections import Counter
    status_counts = Counter(p.status for p in products)
    return {
        "total_wasted":  round(total_wasted, 2),
        "waste_count":   len(waste_logs),
        "expiring_soon": len(expiring_soon),
        "total_products": len(products),
        "fresh_count":   status_counts.get("fresh", 0),
        "warning_count": status_counts.get("warning", 0),
        "danger_count":  status_counts.get("danger", 0),
        "expired_count": status_counts.get("expired", 0),
    }

# --- Notifications (manual trigger para demo) ---

@app.post("/notify/check")
def check_and_notify(db: Session = Depends(get_db)):
    products = db.query(Product).filter(
        Product.status != "discarded",
        Product.phone_number != None,
        Product.notified == 0,
    ).all()
    sent = 0
    for p in products:
        if not p.expiry_date:
            continue
        days_left = (p.expiry_date - datetime.utcnow()).days
        if days_left <= 2:
            msg = format_expiry_message(p.name, days_left)
            if send_whatsapp(p.phone_number, msg):
                p.notified = 1
                sent += 1
    db.commit()
    return {"notifications_sent": sent}
