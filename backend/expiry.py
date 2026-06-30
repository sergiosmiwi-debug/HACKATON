from datetime import datetime, timedelta

SHELF_LIFE = {
    "leche": {"closed": 7, "opened": 3},
    "yogur": {"closed": 14, "opened": 5},
    "queso": {"closed": 14, "opened": 7},
    "huevos": {"closed": 21, "opened": 21},
    "pollo": {"closed": 2, "opened": 1},
    "carne": {"closed": 3, "opened": 2},
    "pescado": {"closed": 2, "opened": 1},
    "tomate": {"closed": 5, "opened": 5},
    "lechuga": {"closed": 5, "opened": 3},
    "zanahoria": {"closed": 14, "opened": 14},
    "manzana": {"closed": 14, "opened": 14},
    "naranja": {"closed": 14, "opened": 14},
    "pan": {"closed": 5, "opened": 3},
    "mantequilla": {"closed": 30, "opened": 14},
    "jugo": {"closed": 14, "opened": 5},
    "refresco": {"closed": 180, "opened": 3},
    "gaseosa": {"closed": 180, "opened": 3},
    "cerveza": {"closed": 270, "opened": 1},
    "vino": {"closed": 365, "opened": 5},
    # Sellado pero sin fecha clara de vencimiento corto: no cuenta hasta que se abre.
    "default": {"closed": 180, "opened": 14},
}

def get_shelf_life(product_name: str, opened: bool = False) -> int:
    name_lower = product_name.lower()
    for key in SHELF_LIFE:
        if key in name_lower:
            return SHELF_LIFE[key]["opened" if opened else "closed"]
    return SHELF_LIFE["default"]["opened" if opened else "closed"]

def calculate_expiry(product_name: str, purchase_date: datetime, opened_date: datetime = None) -> datetime:
    if opened_date:
        days = get_shelf_life(product_name, opened=True)
        return opened_date + timedelta(days=days)
    days = get_shelf_life(product_name, opened=False)
    return purchase_date + timedelta(days=days)

def get_status(expiry_date: datetime) -> str:
    now = datetime.utcnow()
    days_left = (expiry_date - now).days
    if days_left < 0:
        return "expired"
    elif days_left <= 1:
        return "danger"
    elif days_left <= 3:
        return "warning"
    return "fresh"
