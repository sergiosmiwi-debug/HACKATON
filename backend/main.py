from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

from models import init_db, get_db, Product, WasteLog, ProductStatus
from expiry import calculate_expiry, get_status, get_shelf_life
from gemini_service import init_gemini, scan_receipt, scan_fridge

app = FastAPI(title="QuipuRecicla API")

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

def get_device(x_device_id: Optional[str] = Header(default=None)) -> Optional[str]:
    return x_device_id

# --- Scan ---

@app.post("/scan/receipt")
async def scan_receipt_endpoint(
    file: UploadFile = File(...),
    device_id: Optional[str] = None,
    db: Session = Depends(get_db),
    did: Optional[str] = Depends(get_device),
):
    effective_device = device_id or did
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
            device_id=effective_device,
        )
        db.add(product)
        created.append(item["name"])
    db.commit()
    return {"detected": created, "count": len(created)}

@app.post("/scan/fridge")
async def scan_fridge_endpoint(
    file: UploadFile = File(...),
    device_id: Optional[str] = None,
    db: Session = Depends(get_db),
    did: Optional[str] = Depends(get_device),
):
    effective_device = device_id or did
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
            device_id=effective_device,
        )
        db.add(product)
        created.append(item["name"])
    db.commit()
    return {"detected": created, "count": len(created)}

# --- Products ---

@app.get("/products")
def get_products(db: Session = Depends(get_db), did: Optional[str] = Depends(get_device)):
    q = db.query(Product).filter(Product.status != "discarded")
    if did:
        q = q.filter(Product.device_id == did)
    products = q.all()
    result = []
    for p in products:
        days_left = None
        if p.expiry_date:
            days_left = (p.expiry_date - datetime.utcnow()).days
            p.status = get_status(p.expiry_date)
        closed_life = get_shelf_life(p.name, opened=False)
        opened_life = get_shelf_life(p.name, opened=True)
        result.append({
            "id": p.id, "name": p.name, "category": p.category,
            "quantity": p.quantity,
            "purchase_date": p.purchase_date.isoformat() if p.purchase_date else None,
            "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
            "days_left": days_left, "status": p.status,
            "purchase_price": p.purchase_price,
            "opened_date": p.opened_date.isoformat() if p.opened_date else None,
            "changes_on_open": closed_life != opened_life,
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

@app.post("/products/{product_id}/consume")
def consume_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product.status = "discarded"
    db.commit()
    return {"message": f"{product.name} marcado como consumido"}

@app.delete("/products/{product_id}")
def discard_product(product_id: int, db: Session = Depends(get_db), did: Optional[str] = Depends(get_device)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    waste = WasteLog(
        product_name=product.name,
        price=product.purchase_price,
        device_id=did or product.device_id,
    )
    db.add(waste)
    product.status = "discarded"
    db.commit()
    return {"message": f"{product.name} descartado"}

class ProductCreate(BaseModel):
    name: str
    quantity: str = "1"
    purchase_price: float = 0.0
    device_id: Optional[str] = None

@app.post("/products")
def create_product(data: ProductCreate, db: Session = Depends(get_db), did: Optional[str] = Depends(get_device)):
    purchase_date = datetime.utcnow()
    expiry_date = calculate_expiry(data.name, purchase_date)
    product = Product(
        name=data.name,
        quantity=data.quantity,
        purchase_price=data.purchase_price,
        purchase_date=purchase_date,
        expiry_date=expiry_date,
        status=get_status(expiry_date),
        device_id=data.device_id or did,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"id": product.id, "name": product.name, "expiry_date": product.expiry_date.isoformat()}

# --- Dashboard ---

@app.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    did: Optional[str] = Depends(get_device),
    period: str = Query(default="week", description="today|week|month|all"),
):
    now = datetime.utcnow()
    if period == "today":
        since = now - timedelta(days=1)
    elif period == "week":
        since = now - timedelta(days=7)
    elif period == "month":
        since = now - timedelta(days=30)
    else:
        since = None  # "all"

    wq = db.query(WasteLog)
    if did:
        wq = wq.filter(WasteLog.device_id == did)
    if since:
        wq = wq.filter(WasteLog.discarded_at >= since)
    waste_logs = wq.all()
    total_wasted = sum(w.price for w in waste_logs)

    pq = db.query(Product).filter(Product.status != "discarded")
    if did:
        pq = pq.filter(Product.device_id == did)
    products = pq.all()
    expiring_soon = [p for p in products if p.expiry_date and (p.expiry_date - now).days <= 3]

    from collections import Counter
    status_counts = Counter(p.status for p in products)
    waste_items = sorted(
        [{"id": w.id, "name": w.product_name, "price": w.price, "discarded_at": w.discarded_at.isoformat()} for w in waste_logs],
        key=lambda x: x["discarded_at"], reverse=True,
    )
    return {
        "total_wasted":   round(total_wasted, 2),
        "waste_count":    len(waste_logs),
        "expiring_soon":  len(expiring_soon),
        "total_products": len(products),
        "fresh_count":    status_counts.get("fresh", 0),
        "warning_count":  status_counts.get("warning", 0),
        "danger_count":   status_counts.get("danger", 0),
        "expired_count":  status_counts.get("expired", 0),
        "period":         period,
        "waste_items":    waste_items,
    }

@app.delete("/dashboard/waste/{waste_id}")
def remove_waste_entry(waste_id: int, db: Session = Depends(get_db)):
    waste = db.query(WasteLog).filter(WasteLog.id == waste_id).first()
    if not waste:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    db.delete(waste)
    db.commit()
    return {"message": "Registro eliminado del cuadre"}

@app.delete("/dashboard/reset")
def reset_waste(db: Session = Depends(get_db), did: Optional[str] = Depends(get_device)):
    q = db.query(WasteLog)
    if did:
        q = q.filter(WasteLog.device_id == did)
    q.delete()
    db.commit()
    return {"message": "Contador reiniciado"}

@app.delete("/admin/wipe-all")
def wipe_all(db: Session = Depends(get_db), x_admin_key: Optional[str] = Header(default=None)):
    if not os.getenv("ADMIN_WIPE_KEY") or x_admin_key != os.getenv("ADMIN_WIPE_KEY"):
        raise HTTPException(status_code=403, detail="No autorizado")
    db.query(Product).delete()
    db.query(WasteLog).delete()
    db.commit()
    return {"message": "Base de datos vaciada por completo"}
